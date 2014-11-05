from models import FigConf
from sgweb import *
from json import dumps

from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, render_to_response
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.template import RequestContext

from django.contrib.auth.decorators import login_required

from .models import DataProject




# --------- views ------------

def index(request):

  context = RequestContext(request)
 
  return render_to_response('sgdata/index.html',{'FigConf':FigConf.objects.all()}, context)

def ret_field(request, project,exp, field):


  context = RequestContext(request)

#  print project
#  print exp
#  print field
  fld, _ = get_field(project,exp, field)


  msg = make_json(fld)
  return HttpResponse(msg)

def projects(request):

  context = RequestContext(request)

  idict = sg.info_dict()

  return HttpResponse(dumps(idict.keys()))

def list_exp(request,project,exp):

  project_obj = DataProject.objects.filter(name=project) 
 
  if project_obj[0].restricted:
    if not request.user.is_authenticated():
      return HttpResponse(dumps({'ndim':-1,'msg':'Login to view this data.'}))
    elif not ( project_obj.filter(groups__in=request.user.groups.all()) ):
      return HttpResponse(dumps({'ndim':-2,'msg':'User not authorized to view this data.'}))

  context = RequestContext(request)
  D = sg.info_dict()
  P = sg.Project(D[project])
  E = P[exp]

  expers = P.expers.keys()
  axes = [ax.name for ax in P.expers.values()[0].axes]

  msg = {"vars":E.available(), "coords":[crd.name for crd in E.cstack]}

  return HttpResponse(dumps(msg))

def list_project(request,project):

  project_obj = DataProject.objects.filter(name=project) 
 
  if project_obj[0].restricted:
    if not request.user.is_authenticated():
      return HttpResponse(dumps({"expers":[], "axes":-1}))
    elif not ( project_obj.filter(groups__in=request.user.groups.all()) ):
      return HttpResponse(dumps({"expers":[], "axes":-2}))

  context = RequestContext(request)
  D = sg.info_dict()
  P = sg.Project(D[project])
  expers = P.expers.keys()
  axes = [ax.name for ax in P.expers.values()[0].axes]
  fields = [P.expers[e].available() for e in expers]

  msg = {"expers":zip(expers,fields), "axes":axes}

  return HttpResponse(dumps(msg))


def return_list_ops(request,project):

  project_obj = DataProject.objects.filter(name=project) 
 
  if project_obj[0].restricted:
    if not request.user.is_authenticated():
      return HttpResponse(dumps({'ndim':-1,'msg':'Login to view this data.'}))
    elif not ( project_obj.filter(groups__in=request.user.groups.all()) ):
      return HttpResponse(dumps({'ndim':-2,'msg':'User not authorized to view this data.'}))

  context = RequestContext(request)
  D = sg.info_dict()
  P = sg.Project(D[project])
  E = P.expers.values()[0]

#  axes = [ax.name for ax in P.expers.values()[0].axes]

  msg = list_ops(P,E)

  return HttpResponse(dumps(msg))



def ret_field_ops(request, project,fields):
  """
  project: (str) project name
  
  """

 # print request.user

  project_obj = DataProject.objects.filter(name=project) 
 
  if project_obj[0].restricted:
    if not request.user.is_authenticated():
      return HttpResponse(dumps({'ndim':-1,'msg':'Login to view this data.'}))
    elif not ( project_obj.filter(groups__in=request.user.groups.all()) ):
      return HttpResponse(dumps({'ndim':-2,'msg':'User not authorized to view this data.'}))

  context = RequestContext(request)
 
  D = sg.info_dict()
  P = sg.Project(D[project])

  E = P.expers.values()[0]

  knownobs = build_knownobs(P,E)

  if 'ops' in request.GET:
    comstr = request.GET['ops']

    ops = interpret(comstr,knownobs,obchain=[] )[-1]
  else:
    ops = id_op

  I=interpret(fields,knownobs,obchain=[],op=ops)

  fld = I[-1]

  expname=I[-2].name

 # interpret returns a string when the object is not known: change this
 # print type(ops)

#  fld = getattr(fld,method)(args)
  msg = make_json(fld,expname )
  return HttpResponse(msg)




def get_fig_conf(request,fig_id):

  try:
    fig = FigConf.objects.get(id=fig_id)
  except FigConf.DoesNotExist:
    raise Http404


  args0=['mkChkExp','mkChkFld','adChkExp','adChkFld','selpc','smag','Op1','Op2','Op3','cycle3D','contog','cmap','kmt','Submit','id','project']

  args1=[unpack(fig.mkChkExp),unpack(fig.mkChkFld),unpack(fig.adChkExp),unpack(fig.adChkFld),fig.selpc,fig.smag,fig.Op1,fig.Op2,fig.Op3,fig.cycle3D,fig.contog,fig.cmap,fig.kmt,fig.Submit,fig_id,fig.project.name]

  
  msg = dumps([args0,args1] )
  return HttpResponse(msg)

def get_fig_div_conf(request,pageDiv):

  try:
    figs = FigConf.objects.filter(pageDiv__exact=pageDiv)
  except FigConf.DoesNotExist:
    raise Http404

  args0=['mkChkExp','mkChkFld','adChkExp','adChkFld','selpc','smag','Op1','Op2','Op3','cycle3D','contog','cmap','kmt','Submit','id',"project"]
  fig_list=[]

  for fig in figs:
    args1=[unpack(fig.mkChkExp),unpack(fig.mkChkFld),unpack(fig.adChkExp),unpack(fig.adChkFld),fig.selpc,fig.smag,fig.Op1,fig.Op2,fig.Op3,fig.cycle3D,fig.contog,fig.cmap,fig.kmt,fig.Submit,fig.id,fig.project.name]
    fig_list.append([args0,args1])
  
  msg = dumps( fig_list)
  return HttpResponse(msg)


def fig_comments(request,fig_id):
  """ Comments to figure. Integrates with Mezzanine. Comments rendered on separate page. 
  """
  try:
    figconf = FigConf.objects.get(id=fig_id)
  except:
    raise Http404

  context = {'figconf': figconf}
  return render(request, 'sgdata/fig_comments.html', context)

def fig_view(request,fig_id):
  """ view page for figure. Integrates with Mezzanine. Comments rendered on separate page. 
  """
  try:
    figconf = FigConf.objects.get(id=fig_id)
  except:
    raise Http404

  context = {'figconf': figconf}
  return render(request, 'sgdata/fig_view.html', context)





@csrf_exempt
def del_fig(request,fig_id):

    if fig_id !=-1:
      try: 
        f = FigConf.objects.get(id=fig_id)

        f.delete()
      except FigConf.DoesNotExist:
        fig_id=-1


   

    return HttpResponse(dumps(fig_id))











@login_required
@csrf_exempt
def save_fig(request):

  mkChkExp = request.POST.getlist('expchecks')
  mkChkFld =  request.POST.getlist('checkFSL')

  adChkExp = request.POST.getlist('expradios')
  adChkFld = request.POST.getlist('radFSL')

  selpc = request.POST['selpc']
  smag = request.POST['smag']

  Op1 = request.POST['Op1']
  Op2 = request.POST['Op2']
  Op3 = request.POST['Op3']    

  try:
    cycle3D = request.POST['cycle3D']
  except:
    cycle3D = 'None'

  try:
    contog = request.POST['hiddenCont']
    if (contog == 'True'):
      contog = True
    else:
      contog = False  
  except:
    contog = False

  try:
    cmap = request.POST['cmap']
  except:
    cmap = 'False'

  try:
    kmt = request.POST['hiddenKmt']
    if (kmt == 'True'):
      kmt = True
    else:
      kmt = False  
  except:
    kmt = False

  try:
    Submit = request.POST['submitHidden']
  except:
    Submit = False

  try:
    project_name = request.POST['projectHidden']

    project = DataProject.objects.get(name=project_name)
  except:
    raise Http404

  try:
    pageDiv = request.POST['pageDivHidden']
  except:
    pageDiv = 'unknown'
    
  try:
    idHidden = int(request.POST['idHidden'])
  except:
    idHidden = -1    

  if idHidden == -1:
    f = FigConf(mkChkExp=pack(mkChkExp),mkChkFld=pack(mkChkFld),adChkExp=pack(adChkExp),adChkFld=pack(adChkFld),selpc=selpc,smag=smag,Op1=Op1,Op2=Op2,Op3=Op3,cycle3D=cycle3D,contog=contog,cmap=cmap,kmt=kmt,Submit=Submit,pageDiv=pageDiv,project=project)

    f.save()
  else:
    try: 
      f = FigConf.objects.get(id=idHidden)

      f.mkChkExp=pack(mkChkExp);f.mkChkFld=pack(mkChkFld);f.adChkExp=pack(adChkExp);f.adChkFld=pack(adChkFld);f.selpc=selpc;f.smag=smag;f.Op1=Op1;f.Op2=Op2;f.Op3=Op3;f.cycle3D=cycle3D;f.contog=contog;f.cmap=cmap;f.kmt=kmt;f.Submit=Submit;f.pageDiv=pageDiv;f.project=project;
      f.save()
    except FigConf.DoesNotExist:
      pass




  return HttpResponseRedirect(request.META.get('HTTP_REFERER'))

def pack(L,sep='**'):
  return sep.join(L)

def unpack(packstr,sep='**'):
  return packstr.split(sep)

def gmaps(request):
	context = RequestContext(request)
	return render_to_response('sgdata/gmaps.html', context)


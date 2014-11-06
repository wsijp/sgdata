
import numpy as np
import spacegrids as sg
import copy
from json import dumps

def id_op(a):
  return a

def list_ops(P,E):

  knownobs = init_knownobs(P,E)
  _, oplist = make_ops(knownobs)

  oplist = oplist

  return oplist

def build_knownobs(P,E):

  knownobs = init_knownobs(P,E)
  knownobs, _ = make_ops(knownobs)

  return knownobs

def make_ops(knownobs):
 
    new_keys=[]
    # create operators
    axnames=['X','Y','Z','T']
    opnames=["Prim","Integ","Mean"] 

    op=sg.nop 
    opkey="nop"
    new_keys.append(opkey)
    knownobs[opkey] = op

    for opname in opnames:
      for an in axnames:
    
        opkey=opname+an
        new_keys.append(opkey)
        op=getattr(sg,opname)(knownobs[an])
        knownobs[opkey] = op

    opname="Slice"
    for an in axnames:
      opkey='Slice'+an+'0'
      new_keys.append(opkey)
      op=getattr(sg,opname)( (knownobs[an],0) )
      knownobs[opkey] = op

    node=(knownobs['X'],85,knownobs['Y'],30)  
    op=sg.PickBasin(node)
    opkey="PickAtlantic"
    new_keys.append(opkey)
    knownobs[opkey] = op

    op=sg.ops.kelvin2c
    opkey="kelvin2c"
    new_keys.append(opkey)
    knownobs[opkey] = op    

    return knownobs,new_keys

def init_knownobs(P,E):


  knownobs = {'P':P,'E':E}

    # bring axes and coords into main objects knownobs:
  
  for a in knownobs['E'].axes:
    knownobs[a.name] = a

  for a in knownobs['E'].cstack:
    knownobs[a.name] = a  

  return knownobs


def interpret_exp(comstr):

 # print comstr
  if '-' in comstr:
    members=comstr.split('-')
    if '+' in members[0]:
#      what to do here:
      return {'op':'plus_minus','members':members[:2]}
    else:  
      return {'op':'minus','members':members[:2]}

  elif '+' in comstr:
    members=comstr.split('+')
    return {'op':'concat','members':members}

  return {'op':'none','members':[comstr]}


def str_index(dlm,st):

    if dlm in st:
      return {'dlm':dlm,'index':st.index(dlm)}
    else:
      return {'dlm':dlm,'index':999}      

def find_first(dlms,st):
  """
  Find which of the list of delimeters dlms occurs first in string st.

  To be used in conjunction with interpret for keywords of equal rank, such as . and __
  There, find out which one occurs first, and if any, and split with that dlm.
  """
  values=[str_index(dlm,st)['index'] for dlm in dlms ]
 
  m=min(values)
  if m< 999:
    return dlms[values.index(m) ]
  else:
    return 
  
def field_alias(knownob,comstr):

  if comstr == '$kmt$':
    for kmtAttempt in ['G_kmt','kmt']:
      if kmtAttempt in knownob.available():
        break
    return kmtAttempt
  else:
    return comstr




def interpret(comstr,knownobs,obchain=[], op = id_op):
    """
    interprets objects and their attributes (methods not executed) and items (as in __getitem__)
    e.g. knownobs = {'P':P,'E':E}

    obchain is used to when looking for attributes
    """

# next task to build function that regrids all fields to common grid

    #print obchain


    if '-' in comstr:
      mults = comstr.split('-')
      obchains = [interpret(e,knownobs,obchain=[],op=op) for e in mults ] 
      fields = [e[-1] for e in obchains ] # the last element of each obchain is the field
      E = obchains[0][-2]

      if len(fields)>2:
        print 'use - only once'
        return

      commongr = reduce(lambda x,y: x.grid*y.grid, fields)
      fields = [f.regrid(commongr) for f in fields]      

      return [E,fields[0] - fields[1]]

    if '*' in comstr:
      mults = comstr.split('*')
      

      mul_ops= [interpret(x,knownobs,obchain=[],op=op)[-1] for x in mults if x !='nop']

      if len(mul_ops)>0:
        # return a list of length 1 containing the product of the interpreted elements.
        return [reduce(lambda x,y:x*y, mul_ops )]
      else:
        return [knownobs['nop'],]  

    if '++' in comstr:
      # We're assuming the elements are fields
   
      W = sg.Ax("exper")

#      fields = [interpret(e,knownobs,obchain=[],op=op)[-1] for e in mults ] 

      mults = comstr.split('++')
      obchains = [interpret(e,knownobs,obchain=[],op=op) for e in mults ] 
      fields = [e[-1] for e in obchains ] # the last element of each obchain is the field
      Es = [ e[-2] for e in obchains ]
      E = Es[0]

      grids = [e.grid for e in fields]
      commongr = reduce(lambda x,y: x*y, grids)
      fields = [f.regrid(commongr) for f in fields]

      return [E,sg.concatenate( fields , ax=W,strings = [e.name for e in Es]) ]
  

    if '+' in comstr:
      mults = comstr.split('+')
      
      return [reduce(lambda x,y:interpret(x,knownobs,obchain=[],op=op)[-1]+interpret(y,knownobs,obchain=[],op=op)[-1], mults )]

#    elif (op is not None):
      # this is not a compound, but we need to apply op if we've just dropped in

#      print 'hier ',
#      print comstr + '  ',
#      print obchain
#      print op(interpret(comstr,knownobs,obchain=[], op = None)[-1])
#      print '----'
#      return [ op(interpret(comstr,knownobs,obchain=[], op = None)[-1]) ]
 

#    if '__' in comstr:
    
#      chain = [interpret(e, knownobs,obchain=[])[-1] for e in comstr.split('__') ]
  
#      return [reduce( lambda x,y:x[y], chain)]


   # print comstr          
#    if '.' in comstr:

# ----- properties -------

    dlm = find_first(['__','..'],comstr)  
    if dlm:
      split2 = comstr.split(dlm,1) # look at leftmost element

      if obchain:
        obchain.append( (interpret(split2[0], knownobs,obchain,op=op)[-1],dlm  )  )
        return interpret(split2[1], knownobs,obchain,op=op)
        
      else:
        # we're at the head of the chain
        if split2[0] in knownobs:
          obchain.append( (knownobs[split2[0]],dlm  ) )
          
        else:
          raise Exception('Parsing error for %s of type %s'%(split2[0], type(split2[0])  ))

      return interpret(split2[1], knownobs,obchain,op=op)

    else:
      # it is not a *, __ or . separated compound
      # treated as a primitive element, to be interpreted either
      # in the context of the obchain and/ or (known objects) knownobs

      if obchain:
        # if there is an obchain, we have been decending into attributes (perhaps of attributes)

        # does the last element of the obchain have an attribute corresponding with the current comstr?
        knownob = obchain[-1][0]
        dlm = obchain[-1][1]

#        print 'knownob ',
#        print  knownob

        if dlm == '..':

          attrs = dir(knownob)
      
          if comstr in attrs:
            # current piece is an attribute, get the value and append
            obchain.append( (getattr(knownob, comstr  ) , dlm )  )          
          else:
            raise Exception('Parsing error for .: %s not attr of %s'%(comstr,knownob))  

        elif dlm == '__':
   #         print knownob[comstr]
            try:
              comstr = int(comstr)
            except:
              pass
            
            retval = knownob[comstr]
 
            if retval is None:

              knownob.load(field_alias(knownob,comstr))                
              retval = op(knownob[field_alias(knownob,comstr)])

            obchain.append( (retval , dlm )  )          
            
      else:

        # we're at the head and end of the chain
        if comstr in knownobs:
          # the element is a known object
          obchain.append((knownobs[comstr], None  ) )        

        else:
          # the element must be a number
          try:
            i=int(comstr)


          except ValueError:
            if '.' in comstr:
              try:
                f=float(comstr)
              except:
                obchain.append( (comstr, None ) )   
              else:
                obchain.append( (sg.FloatMul(f), None ) )                  
            else:            
              obchain.append( (comstr, None ) )                 
          else:

            obchain.append((i, None ) )                      


      # obchain of length 1 if no attributes are sought
      # don't return the dlm part of the tuples
      return [e[0] for e in obchain  ]  # always extract the last element of this chain



def find_mirror(fld):
  """Prepare field for orientation appropriate for client-side contour function.
  """
#  F.value = np.flipud(F.value)

  grid = fld.grid



  if hasattr(grid[0],'axis'):
    if grid[0].axis.name == 'Z':
      fld=grid[0].flip(fld)


#      fld.grid[0].value = -fld.grid[0].value 
 #     fld.grid[0].dual.value = -fld.grid[0].dual.value 
 
      # make copies of z coord. This because if the fld belongs to a range of slices, mutating one field's grid directly affects the others, leading to accumulating changes to the Coord.
      yscale=1e-3
      new_zcoord = fld.grid[0].copy(name='new_z',value=yscale*np.flipud(fld.grid[0].value)) 
      new_zcoord.dual = fld.grid[0].dual.copy(name='new_z',value=yscale*np.flipud(fld.grid[0].dual.value ))

      # grids are non-permutable, so construct via multiplication
      fld.grid = new_zcoord*fld.grid

#      fld.grid[0].dual.value = np.concatenate([np.array([fld.grid[0].dual.value[0],]), fld.grid[0].dual.value])

    elif (len(grid)>1) and (grid[1].axis.name == 'Z'):
#      fld=grid[1].flip(fld)
      pass
  return fld


def make_msg(fld,expname='None'):
 
  M = np.nanmax(fld.value)
  m = np.nanmin(fld.value)

  ndim = fld.value.ndim 
  
  if ndim == 3:
    coord0 = fld.grid[0]
    fsliced = fld.regrid(coord0**2)
    msg = {'name':fld.name,'lname':fld.long_name,'M':str(M),'m':str(m), 'ndim':ndim, 'units':fld.units}
    
    msg["slices"] = [make_msg(e,expname) for e in fsliced]
    msg["scoord"] = coord0.value.tolist()   

    # EXIT POINT
    return msg
  
  fld = find_mirror(fld)

  try:
    fld.value[np.isnan(fld.value)] = -9e20
  except:
    pass

  msg = {'name':fld.name,'lname':fld.long_name,'value':fld.value.tolist() ,'M':str(M),'m':str(m) , 'ndim':ndim, 'units':fld.units,'expname':expname }

  for i,coord in enumerate(fld.grid):
    msg['coord'+str(i)] = fld.grid[i].value.tolist()
    msg['coord'+str(i)+'_edges'] = fld.grid[i].dual.value.tolist()
    msg['coord'+str(i)+'_lname'] = fld.grid[i].long_name
    msg['coord'+str(i)+'_units'] = fld.grid[i].units
    msg['coord'+str(i)+'_axis'] = fld.grid[i].axis.name
    if fld.grid[i].strings is None:
      strings = []
    else:
      strings = fld.grid[i].strings 
   
    msg['coord'+str(i)+'_strings'] = strings    

  return msg
  
def make_json(msg,expname='None'):

  return dumps(make_msg(msg,expname))


def execute_ops(P,opob,field):

  # opob is the operation and experiment dictionary 
  # opob['members'] are exp objects
  # opob['members'] is a list of (str) experiment names, arising from a split
  if (opob is not None):
    
    if (opob['op'] == 'none'):
      # for the no op, just pick the field for the 1st experiment
      E = P[opob['members'][0]]
      field = field_alias(E,field)
      E.load(field)
      fld = E[field]

    elif   (opob['op'] == 'plus_minus'):
      # in this case, we know that the first member contains further decomposable elements, so we interpret it.
      sub_opob = interpret_exp(opob['members'][0])
      left_fld = execute_ops(P,sub_opob,field)
      E = P[opob['members'][1]]
      field = field_alias(E,field)      
      E.load(field)
      right_fld = E[field]

      join_grid = left_fld.grid*right_fld.grid
      fld = left_fld.regrid(join_grid) - right_fld.regrid(join_grid)

    elif (opob['op'] == 'minus'):
      E_left = P[opob['members'][0]]
      E_right = P[opob['members'][1]]
      E_left.load(field)
      E_right.load(field)
      fld = E_left[field] - E_right[field]
    elif (opob['op'] == 'concat'):
      flds=[]
      for m in opob['members']:
        sub_opob = interpret_exp(m)
        flds.append(execute_ops(P,sub_opob,field) )

      W=sg.Ax("exper")
      fld = sg.concatenate(flds , ax=W ) 


  else:
    # if opob is None, no experiments were retrieved
    fld = None

  return fld

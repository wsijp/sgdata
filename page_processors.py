from mezzanine.pages.page_processors import processor_for
from django.http import HttpResponseForbidden
from django.shortcuts import redirect
from django.conf import settings
from urllib2 import quote
from .models import figPage


@processor_for(figPage)
def page_view(request, page):
    """
    When a fig page is requested, compare the user's group memberships to those of the page.
    If the user is a member of at least one of the page's groups, display save button in template.  
    """
    this_page = figPage.objects.filter(slug=page.slug)
    this_page_ob = list(this_page[:1])[0]

    # if this is a restricted page, inappropriate users will be diverted here:
    if this_page_ob.restricted:
      
        if not request.user.is_authenticated():
            redirect_url = "%s?next=%s" % (settings.LOGIN_URL, quote(request.path))
            return redirect(redirect_url)
        if not this_page.filter(groups__in=request.user.groups.all()):
            return HttpResponseForbidden()
      


    project = this_page_ob.project

#    print project

    try:  # having trouble with non-logged in user
   
        
        
        if (request.user is not None) and request.user.is_authenticated() and (this_page.filter(groups__in=request.user.groups.all()) ):
            return {"page": page,"project": project,"save_but":True} 
    except:
        return {"page": page,"project": project,"save_but":False}   
    else: 
        return {"page": page,"project": project,"save_but":False}

#        return HttpResponseForbidden()

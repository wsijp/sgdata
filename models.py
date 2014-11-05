from django.db import models
from mezzanine.generic.fields import CommentsField
from django.http import HttpResponseRedirect
#from django.db.models import permalink


from django.core.urlresolvers import reverse

from mezzanine.pages.models import Page
from mezzanine.core.models import RichText
from django.contrib.auth.models import Group, User

class DataProject(models.Model):
    groups = models.ManyToManyField(Group)
    name = models.CharField(max_length=128)
    text = models.CharField(max_length=500)
    restricted = models.BooleanField(default=False)

    def __unicode__(self):  # Python 3: def __str__(self):
        return self.name

class figPage(Page, RichText):
    """
    Create a new content type that behaves just like a RichText Page, except that it includes a
    reference to django.contrib.auth.models.Group.
    """
    groups = models.ManyToManyField(Group)
    project = models.ForeignKey(DataProject)    
    restricted = models.BooleanField(default=False)

class FigConf(models.Model):

#    user
#    title = models.CharField(max_length=100, unique=True)
#    posted = models.DateField(db_index=True, auto_now_add=True)
#    caption = models.TextField()
    mkChkExp = models.CharField(max_length=600)
    mkChkFld = models.CharField(max_length=100)
    adChkExp = models.CharField(max_length=600)
    adChkFld = models.CharField(max_length=100)
    selpc = models.CharField(max_length=20)
    smag = models.CharField(max_length=20)
    Op1 = models.CharField(max_length=30)
    Op2 = models.CharField(max_length=30)    
    Op3 = models.CharField(max_length=30)
    cycle3D = models.CharField(max_length=10)
    contog = models.BooleanField()
    cmap = models.CharField(max_length=30)
    kmt = models.BooleanField()
    Submit = models.BooleanField()
    pageDiv = models.CharField(max_length=128)
    comments = CommentsField()
    project = models.ForeignKey(DataProject)
    
    def get_absolute_url(self):
 
#      return 'fig_view/'+str(self.id)
      return reverse('fig_view', kwargs={'fig_id':str(self.id)} )

#    item = models.ForeignKey(DataProjectItem)

#class DataProjectItem(models.Model):    
#    text = models.CharField(max_length=500)   
#    project = models.ForeignKey(Project)
#    user = models.ForeignKey(User)
#    date = models.DateTimeField("date")
#    restricted = models.BooleanField(default=False)  # check user in sgdata view if True
#    pageDiv = models.CharField(max_length=128)


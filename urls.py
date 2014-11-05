
from django.conf.urls import patterns, url
from sgdata import views

urlpatterns = patterns('',url(r'^$',views.index, name='index' ),  
	                      url(r'^save_fig/$',views.save_fig,name='save_fig'),
	                      url(r'^del_fig/(?P<fig_id>[\w]+)$',views.del_fig,name='del_fig'),
	                      url(r'^get_fig/(?P<fig_id>[\w]+)$',views.get_fig_conf,name='get_fig_conf'),
                        url(r'^get_fig_from_div/(?P<pageDiv>[\w\-]+)$',views.get_fig_div_conf,name='get_fig_div_conf'),         
                        url(r'^fig_comments/(?P<fig_id>[\w]+)$',views.fig_comments,name='fig_comments'), 
                        url(r'^fig_view/(?P<fig_id>[\w]+)/$',views.fig_view,name='fig_view'),                                       	                      

                         url(r'^projects/(?P<project>[\w]+)/list_ops/$', views.return_list_ops, name = 'list_ops'),

                         url(r'^projects/(?P<project>[\w]+)/(?P<exp>[\w\.]+)/$', views.list_exp, name = 'list_exp'),


                          url(r'^projects/(?P<project>[\w]+)/$', views.list_project, name = 'list_project'),


                         url(r'^projects/$', views.projects, name = 'projects'),

                           url(r'^(?P<project>[\w]+)/(?P<fields>[\w\-\+\.\$]+)/ops/$', views.ret_field_ops, name = 'ret_field_ops'),                                                    
                          url(r'^gmaps/$', views.gmaps, name = 'gmaps'),

                      )

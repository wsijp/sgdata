# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'FigConf'
        db.create_table(u'sgdata_figconf', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('mkChkExp', self.gf('django.db.models.fields.CharField')(max_length=600)),
            ('mkChkFld', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('adChkExp', self.gf('django.db.models.fields.CharField')(max_length=600)),
            ('adChkFld', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('selpc', self.gf('django.db.models.fields.CharField')(max_length=20)),
            ('smag', self.gf('django.db.models.fields.CharField')(max_length=20)),
            ('Op1', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('Op2', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('Op3', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('cycle3D', self.gf('django.db.models.fields.CharField')(max_length=10)),
            ('contog', self.gf('django.db.models.fields.BooleanField')()),
            ('cmap', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('kmt', self.gf('django.db.models.fields.BooleanField')()),
            ('Submit', self.gf('django.db.models.fields.BooleanField')()),
        ))
        db.send_create_signal(u'sgdata', ['FigConf'])


    def backwards(self, orm):
        # Deleting model 'FigConf'
        db.delete_table(u'sgdata_figconf')


    models = {
        u'sgdata.figconf': {
            'Meta': {'object_name': 'FigConf'},
            'Op1': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'Op2': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'Op3': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'Submit': ('django.db.models.fields.BooleanField', [], {}),
            'adChkExp': ('django.db.models.fields.CharField', [], {'max_length': '600'}),
            'adChkFld': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'cmap': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'contog': ('django.db.models.fields.BooleanField', [], {}),
            'cycle3D': ('django.db.models.fields.CharField', [], {'max_length': '10'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'kmt': ('django.db.models.fields.BooleanField', [], {}),
            'mkChkExp': ('django.db.models.fields.CharField', [], {'max_length': '600'}),
            'mkChkFld': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'selpc': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'smag': ('django.db.models.fields.CharField', [], {'max_length': '20'})
        }
    }

    complete_apps = ['sgdata']
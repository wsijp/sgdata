


//<script type="text/javascript">


//</script>

var cmaps = { Jetlight:['rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,144)','rgb(255,255,191)','rgb(224,243,248)','rgb(171,217,233)','rgb(116,173,209)','rgb(69,117,180)'].reverse(), BWR:['blue','white','red'],BCYR:['#0000DD','cyan','#DDEEFF','yellow','red'],BW:['black','white'],W:['white'],GreenYellow:["#0a0", "#6c0", "#ee0", "#eb4", "#eb9", "#fff"],Jet:['blue','cyan','#FFFFE0','orange','#cc0000'], Greenish:['#000090','#0000FF','#3399FF','#00CCFF','#00CC00','#66FF00','#FFFF00','#FF6633','#CC0000'],Greens:['#f7fcb9','#addd8e','#31a354'], Browns:['#fff7bc','#fec44f','#d95f0e'],Blues:['#ece7f2','#a6bddb','#2b8cbe'],
BluesReds:['#2b8cbe','#a6bddb','#ece7f2','white','#fee8c8','#fdbb84','#e34a33']

}

    var linecols=['steelblue','red','green','black','yellow','blue','cyan','magenta','darkmagenta','darkslategray','grey','goldenrod','steelblue','red','green','black','yellow','blue','cyan','magenta','darkmagenta','darkslategray','grey','goldenrod']

var w=500,
    h=300,
    wcb=50,
    padding=40;


var margin = {top: padding, right: padding+wcb, bottom: padding, left: padding};

function figConfig(ids,values){
    this.ids=ids;
    this.values=values;
    this.fill=function(id,defVal){
        var i=this.ids.indexOf(id)
        if (i>-1){

            return this.values[i]
        }else{
            return defVal
        }
    }

    this.set=function(id,value){
        var i=this.ids.indexOf(id)
        if (i>-1){

            this.values[i]=value
            return 
        }else{
            this.ids.push(id)
            this.values.push(value)
            return 
        }
    }

}

function figFromId(div,id){
    var url="/sgdata/get_fig/"+id
    var addDiv

 
    d3.json(url,function(data){
        var fConf=new figConfig(data[0],data[1]) 
        
        addDiv=createFig(div,fConf)     
    })    

    return addDiv
}

function httpGet(theUrl)
{
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function string_to_slug(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();
  
  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}

function figFrompageDiv(div,pdText){
    var url="/sgdata/get_fig_from_div/"+string_to_slug(pdText)
    var addDiv,
        fConf

 
    d3.json(url,function(data){
        for (i=0;i<data.length;i++){
            fConf=new figConfig(data[i][0],data[i][1]) 
           
            addDiv=createFig(div,fConf)

            var html = httpGet('/sgdata/fig_comments/'+fConf.fill('id','-1'))
            var container=addDiv.append("div")
                     .attr("class","container commentPan"+fConf.fill('id','-1') )
                     .attr("style","display:none;")
                     .html(html)
        }     
    })    

    return addDiv
}



//var fConf=new figConfig(['mkChkExp','mkChkFld','adChkExp','adChkFld','selpc','smag','Op1','Op2','Op3','contog',"cycle3D",'cmap','kmt','Submit'  ],[['DPO'],['O_temp'],['DPC'],['O_temp'],'pcolor','1','MeanX','MeanY','nop' ,true,"5",'BluesReds' ,false ,true ])






function scanPage(project){

    console.log(project)
   
    var div=d3.select(".sgPageDiv")

    figFrompageDiv(div,div.select(".sgPageDivID").text()) 

    div.select(".sgPageDivID").attr("style","display:none;")

}

function scanPageId(div){
    d3.selectAll(".FigID")
      .each(function(){
          
          figFromId(d3.select(this),this.id)
      })
}

function createFig(div,fConf){
                      
//    var div=d3.select("body")
//          .append("div")
//          .attr("id","yo")

    var ctx,
        id=div.attr("id")

    // setting the id this way is an unfortunate hack to allow the delete button code to find this id 

    div=div.append("div")
           .attr("class","container")
           .append("div")
           .attr("class","row")
           .append("div")
           .attr("class","col-xs-8 col-sm-8 col-md-8") 
           .attr("id",id)

    var divPlot=div
                  .append("div")
       //           .attr("id","plots")
                  .style("height",h+2*padding+"px")

    var canvas = divPlot.append("canvas")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("left", margin.left + "px")
        .style("top", margin.top + "px")
        .style("width", w + "px")
        .style("height", h + "px")
        .style("position", "relative")

    var svg = divPlot.append("svg")
//.attr("class","pos_top")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .style("top", -h-3+"px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//        .style("position", "relative")
        

    menuStart(div,fConf)
 

    function clearPlot(div){
	    div.selectAll(".tempbut").remove(); 
        div.selectAll(".cyclebut").remove();
        div.selectAll(".my_pcolor").remove();
    // some of these divs were svg
        div.selectAll(".my_colorbar").remove();
        div.selectAll(".my_flabel").remove();
        div.selectAll(".my_contplot").remove();
        div.selectAll(".my_clabel").remove();

    }

    function refresh2D(div,url,fConf){
    // clear the plot (refresh), fetch and plot the calculated field specified in url.   

        

        clearPlot(div)

        d3.json(url,function(data){dimdesp(div,data,fConf)})

        return div
    }

    function menuStart(div,fConf){
    // Create a figure control menu 
    // use div argument to identify this panel and work with
    // multiple figures on page

        var project=fConf.fill("project")

        var url="/sgdata/projects/"+project +"/"  // get exper info
        d3.json(url,function(data){

            var plotArea=div.select("svg").append("g")
                .attr("class","my_plot")
 
    // div areas for controls
            var fg,
                row
            var container=div.append("div")
                            .attr("class","container contPan")
                            .attr("style","display:none;")

        var contBut=div.append("button")
            .attr("href","")
            .attr("type","button")
            .attr("id","toggleControls")
            .attr("class","btn btn-default")
            .text("Show Controls")
            .on("click", function(){
                if (container.attr("style")=="display:block;"){
                    container.attr("style","display:none;")
                    contBut.text("Controls")
                }else{
                    container.attr("style","display:block;")
                    contBut.text("Hide Controls")
                    }
            });

            if (fConf.fill('id','-1')!=-1){
                var commentPan=d3.select(".commentPan"+fConf.fill('id','-1') )
                var commentBut=div.append("button")
                .attr("href","")
                .attr("type","button")
                .attr("id","toggleComments"+fConf.fill('id','-1'))
                .attr("class","btn btn-default")
                .text("Show Comments")
                .on("click", function(){
                    if (commentPan.attr("style")=="display:block;"){
                        commentPan.attr("style","display:none;")
                        commentBut.text("Comments")
                    }else{
                        commentPan.attr("style","display:block;")
                        commentBut.text("Hide Comments")
                    }
                });
            }
            

            var form=container.append("form")
                    .attr("method","post")
                    .attr("action","/sgdata/save_fig/")
                    .attr("role","form")
                  

            var idFld=form.append("input")
                         .attr("type","hidden")
                         .attr("name","idHidden")

            idFld.attr("value",fConf.fill("id",-1))

            var idFld=form.append("input")
                         .attr("type","hidden")
                         .attr("name","projectHidden")

            idFld.attr("value",fConf.fill("project",-1))

            form.append("input")
                .attr("type","hidden")
                .attr("value",fConf.fill("Submit",false))
                .attr("name","submitHidden")                     

            console.log(string_to_slug(d3.select(".sgPageDivID").text()))
            form.append("input")
                .attr("type","hidden")
                .attr("value",fConf.fill("PageDiv",string_to_slug(d3.select(".sgPageDivID").text())  ))
                .attr("name","pageDivHidden")           
        
  //          row=form.append("div")
    //                .attr("class","row")

            var butDiv=form.append("div")
                .attr("class","butDiv row")

        
            var expDiv=form.append("div")
                .attr("class","expDiv row")
    
            var plTypeDiv=form.append("div")
                .attr("class","plTypeDiv row")

            var opDiv=form.append("div")
                .attr("class","opDiv row")

            var extraDiv=form.append("div")
                 .attr("class","extraDiv row")

            

//            var fs=extraDiv.append("fieldset")
//            fs.append("legend")
//              .text("Additional controls")


            fs=expDiv.append("fieldset")
            fs.append("legend")
              .text("Data files in project")


//    d3.json(url,function(data){
//        makeDropdown(h,data.vars,initVal,fieldInfo)
//            .attr("class","varsel")
//            .attr("name","vars")

        
            if (data.axes==-1){
                div.html("Login to view this data")
                d3.select("#addbut").remove()
                return
            }else if(data.axes==-2){
                div.html("Data access not authorized for this project.")
                d3.select("#addbut").remove()                
            }


     
        // the last arg is initVal. It is the init value to pass to onclick function checkChanged, not the initial data. This is the additional Field selection dropdown that appears upon checking.
            var h=makeChecks(fs,data.expers,"change",checkChanged,"checkbox","expchecks","checkel",fConf.fill('mkChkExp',[]),fConf.fill('mkChkFld',[]));
//        initChecks(fs,['DPO'],".checkel",['O_psi'],checkChanged)

            addChecks(fs,"change",radioChanged,"checkbox","expradios","radioel",fConf.fill('adChkExp',[]),fConf.fill('adChkFld',[]))

    fs.select(".mainCheck")
    .selectAll(".checkSpan")
      .append("span")
      
      .text(function(d){return ' '+d[0]+' '})




            fs=plTypeDiv.append("fieldset") 
            fs.append("legend")
              .text("Underlying plot")

            fg=fs.append("div")
                    .attr("class","form-group")

            fg.append("label")
                .attr("class","control-label col-xs-1 col-sm-1")
                .attr("for","selpc") 
                .text("Plot Type")   

            

            makeDropdown(fg.append("div").attr("class","col-xs-3 col-sm-2"),['pcolor','image'],fConf.fill("selpc","image"),pcolChanged)
                .attr("class","selpcolor form-control input-sm ")
                .attr("id","selpc")
                .attr("name","selpc")
//                .attr("placeholder","col-xs-4")

            var url="/sgdata/projects/"+project+"/list_ops/"
            d3.json(url,function(error,data){ 
    
                if (error) return console.warn(error);

                fs=opDiv.append("fieldset")
                fs.append("legend")
                  .text("Server operations on data")


                fg=fs.append("div")
                    .attr("class","form-group")


                fg.append("label")
                    .attr("class","control-label col-xs-2 col-sm-2")
                    .attr("for","smag")
                    .text("Multiply")    

                makeDropdown(fg.append("div").attr("class","col-xs-2 col-sm-2"),['1e-8','1e-6','1e-4','1e-2','1','1e2','1e4','1e6','1e8'],fConf.fill("smag","1"),opChanged)
                    .attr("class","selmagn  form-control input-sm")
                    .attr("id","smag")
                    .attr("name","smag")

                fs.append("br")

                var opLbls = ["First","Second","Third"]

                for (var i=1;i<4;i++)
                {
                                    fs.append("br")

                    

                    fg=fs.append("div")
                        .attr("class","form-group")

                    fg.append("label")
                        .attr("class","control-label col-sm-2")                
                        .attr("for","Op"+i)
                        .text(opLbls[i-1])

                    makeDropdown(fg.append("div").attr("class","col-xs-3 col-sm-3 col-md-2"),data,fConf.fill("Op"+i,"nop"),opChanged)
                        .attr("class","form-control input-sm selop"+i)
                        .attr("id","Op"+i)
                        .attr("name","Op"+i)
                        
                }



                if(fConf.fill('Submit',false)){
                    butPressed()
                }

            })


            function butPressed(){
        // take all those checkboxes with checked is true
        // and construct array of corresponding values

       
                var w=form.selectAll(".checkel")[0],
                    exps=[],
                    fldstr='',
                    ddbox,
                    ops

            // build the URL segment
                for (var i=0;i<w.length;i++){
                    if (w[i].checked){
                        ddbox=form.select(".fsl"+i).select(".varsel")
//                flds.push(ddbox[0][0].value)
                        exps.push('P__'+w[i].value+'__'+ddbox[0][0].value)
                    }
                }

                w=form.selectAll(".radioel")[0],
                    minusexp=false

        // build the URL segment
                for (var i=0;i<w.length;i++){
                    if (w[i].checked){
                        ddbox=form.select(".fslrad"+i).select(".varsel")
//                flds.push(ddbox[0][0].value)

                        minusexp='P__'+w[i].value+'__'+ddbox[0][0].value
                    }
                }
           
                var op1=form.select(".selop1")[0][0].value,
        
                    op2=form.select(".selop2")[0][0].value,
                    op3=form.select(".selop3")[0][0].value
                    ordmag=form.select(".selmagn")[0][0].value

                ops=[op3,op2,op1,parseFloat(ordmag).toFixed(8)].join("*")
     
                fldstr = exps.join("++")

                if (minusexp){
                    fldstr=fldstr+'-'+minusexp
                }

                if (form.select("#cmap")[0][0] !=null){
                    fConf.set("cmap",form.select("#cmap")[0][0].value)
                
                }

            
          //      if (form.select("#contog")[0][0] !=null){ 

         //           fConf.set("contog",form.select("#contog")[0][0].checked)
         //       }

                
//                console.log(form.select("#hiddenKmt"))
//                 if (form.select("#hiddenKmt")[0][0] !=null){ 
//                console.log(form.select("#hiddenKmt")[0][0].value)
       
//                        fConf.set("kmt",form.select("#hiddenKmt")[0][0].value)
//                }


              
  //      console.log(fldstr)
                refresh2D(div,prep_url(project,fldstr,ops),fConf)


  //      fieldSel(div,exps.join("+"))    
            }

    // PLOT BUTTON


        butDiv.append("button")
            .attr("href","")
            .attr("type","button")
            .attr("id","checkbut")
            .attr("class","btn btn-default")
            .text("Plot")
            .on("click", butPressed)


        var show_save=d3.select(".show_save")
        if ((show_save[0][0]!=null) &&  (show_save.text()=='true'  )  ){

            butDiv.append("button")
                    .attr("id","savebut")
                    .attr("class","btn btn-default")
                    .text("Save")
                    .attr("type","submit")
                    .attr("name","submit")
                    .attr("value","save")

            butDiv.append("a")
                .attr("href","")
                .attr("id","delbut")
                .attr("class","btn btn-default")
                .text("Delete")
          
                .attr("name","delbut")
                .on("click",function(){ 
                    var id=fConf.fill('id','-1')
                    console.log(fConf.fill('id','-1'))
                    if (id!='-1'){ 
                        var url='/sgdata/del_fig/'+id
                        d3.json(url,function(data){console.log("deleted "+data)})
                    }
                    div.remove()
                })


        }else{
            var id=fConf.fill('id','-1')
            console.log(id)
            if (id=='-1'){
                butDiv.append("a")
                    .attr("href","")
                    .attr("id","delbut")
                    .attr("class","btn btn-default")
                    .text("Remove")
                      
                    .attr("name","delbut")
                    .on("click",function(){ 
                        div.remove()
                    })
            }
        }
 
        })
 //   return container
    }

return div
}

function fieldInfo(div,value){
	console.log("Info for " + value)
}

function URLDropdown(div,url,func){

// create dropdown list with field names
    d3.json(url,function(data){
        makeDropdown(div,data.vars,"",func).attr("id","varsel").attr("name","vars")
    });
}


function makeDropdown(div,data,initVal,func){

// create dropdown list with data names
   
    var dn=div.append("select")
 //       .attr("id","varsel")
 //       .attr("name","vars")
        .on("change", function(){func(div, this.value)
    })
        
    dn.selectAll("option")
    .data(data)
    .enter()
    .append("option")
    .text(function(d){return d})
    .attr("value",function(d){return d})
    .attr("id",function(d){return 'op_'+d})    

    
    initVal="#op_"+initVal
    if (initVal!="#op_"){
        dn.select(initVal)
          .attr("selected","selected")
    }

    return dn
}


function fieldSel(h,expFields,initVal){
    // expects one exper


    makeDropdown(h,expFields[1],initVal,fieldInfo)
            .attr("class","varsel")
            .attr("name","vars")

//    d3.json(url,function(data){
//        makeDropdown(h,data.vars,initVal,fieldInfo)
//            .attr("class","varsel")
//            .attr("name","vars")
//    })

    return h
}


function radioChanged(div,expFields,i,checked,initVal){
  
    div.selectAll(".radio").remove()

    if (checked){
 
        var thisDiv=div.select(".checkDiv"+i)
    //    var h=div.select(".checkDiv"+i)
        // the value argument is needed for io in fieldSel

        var h=thisDiv.append("div")
             .attr("name","sel_"+expFields[0])
         
        h.append("label")
         .attr("for","selFldrad")
         .text("subtract Field")

        fieldSel(h, expFields,initVal)
               .attr("class","radio  fslrad"+i)
               .attr("id","selFldrad")
                .select(".varsel")
                .attr("name","radFSL")

        div.selectAll(".radioel")
           .property("checked",false)

        thisDiv.select(".radioel")
           .property("checked",true)
                   
    }
}

function checkChanged(div,expFields,i,checked,initVal){


	if (checked){
	//    var h=div.select(".checkDiv"+i)
        // the value argument is needed for io in fieldSel    

        var h=div.select(".checkDiv"+i)


             .append("div")
                 .attr("name","sel_"+expFields[0])
//                 .attr("class","col-xs-4 col-sm-4 col-sd-4")

        h.append("label")
         .attr("for","selFld")
         .text("Fld ")
 //        .attr("class","control-label col-xs-2 col-sm-2 col-sd-2")

	    fieldSel(h, expFields,initVal)
	            .attr("class","fsl"+i+"")
                .attr("id","selFld")
                .select(".varsel")
                .attr("name","checkFSL")
                .attr("class","varsel ")
             

        console.log("checking this one")               
    }else{

	    div.select(".fsl"+i).remove()
    }
}

function opChanged(div,value){
    console.log('Op dropdown has changed')
}

function pcolChanged(div,value){
    console.log('pcol dropdown has changed')
}
function makeChecks(div,data,action,func,type,name,cls,initData,initFuncVals){
// create check boxes list with data names
// initData array of elements that should be checked on init
// initFuncVals array of associated values that should be given as initVal to func
// for each data element

    var dn=div.append("div")
              .attr("class","tempdiv mainCheck")
        
    dn.selectAll("input")
    .data(data)
    .enter()
    .append("div")
    .attr("class","col-xs-3")
    .attr("class",function(d,i){return "checkDiv"+i} )
    .append("span")
    .attr("class","checkSpan")
//    .text(function(d){return d[0]+' '})
    .append("input")
    .attr("class",cls)
    .attr("type",type)
    .attr("name",name)
    .attr("id",function(d,i){return "myCheck"+i} )
    .attr("value",function(d){return d[0]})
    .property("checked",function(d){
        if (initData.indexOf(d[0])>-1){
            return true
        }else{
            return false
        }
    })
    .each(function(d,i){
        
        var ii=initData.indexOf(d[0])
            
        if (ii>-1){
            
            func(div,d,i,this.checked, initFuncVals[ii])
        }
    })    
    .on(action, function(d,i){
        var ii=initData.indexOf(d[0])
        if (ii>-1){
            func(div,d,i,this.checked, initFuncVals[ii])
        }else{
            func(div,d,i,this.checked, "")           
        }
    })


    return dn
}





function addChecks(div,action,func,type,name,cls,initData,initFuncVals){

// create check boxes list with data names

    var dn=div.select(".mainCheck")
    .selectAll(".checkSpan")

    .append("input")
    .attr("class",cls)
    .attr("name",name)
    .attr("type",type)
//    .attr("id",function(d,i){return "myRadio"+i} )
    .attr("value",function(d){return d[0]})
//    .text(function(d){return d})
//    .attr("value",function(d){return d})

    .property("checked",function(d){
        if (initData.indexOf(d[0])>-1){
            return true
        }else{
            return false
        }
    })
    .each(function(d,i){
       
        var ii=initData.indexOf(d[0])
            
        if (ii>-1){
            console.log("yep "+ii )
            func(div,d,i,this.checked, initFuncVals[ii])
        }
    })    
    .on(action, function(d,i){
        var ii=initData.indexOf(d[0])
        if (ii>-1){
            func(div,d,i,this.checked, initFuncVals[ii])
        }else{
            func(div,d,i,this.checked, "")           
        }
    })








    return dn
}



function handle_more_data(axob,data){

    data = handle_nan(data,NaN);
    data.lname ='' // block out title as this is a secondary plot

    return plot_contour(axob.svg,d3.transpose(data.value),data.coord0,data.coord1,axob.xScale,axob.yScale,data.m,data.M,12, false, true);
}

function handle_nan2D(value,nanval){

    var row
    for (var i=0;i<value.length;i++){
        row=value[i]
        for (var j=0;j<row.length;j++){
            if (row[j] < -8e20){
   
   // this needs to be some other value for d3.max and d3.min to work.
                row[j] = nanval
            }
        }
    }
    return value
}

function handle_nan(data,nanval){
    console.log("handling nan for dim "+data.ndim)
    
    if (data.ndim==1){
      
        for (var i=0;i<data.value.length;i++){
            if (data.value[i]<-8e20){
                data.value[i]=nanval
            }
        }


    }else if (data.ndim==2){
        data.value=handle_nan2D(data.value,nanval)        
    }else{
        for (var i=0;i<data.slices.length;i++){
            data.slices[i].value=handle_nan2D(data.slices[i].value,nanval);
        }    
    }
    return data
}


function dimdesp(div,data,fConf){
//    console.log(data)
    

    if (data.ndim>3){
        console.log("dim > 4 not implemented yet")
        return
    }else if (data.ndim>1){

        if (data.ndim==2){
            // if the 2D data is very narrow, interpret as collection of time series:
            if(data.coord0.length<10){
                handle_series(div,data)
            }else{
                rha(div,data,fConf)
            }

        }else{
            rha(div,data,fConf)
        }
    }else if (data.ndim<=-1){
       
        div.html(data.msg)
    }else {
        console.log('1D')
        handle1Ds(div,data)
    }
}


function init_nseries(value,coord){
    // initiate an "nseries" array of key-value objects, with key an int index, with values containing arrays of 
    // x,y valued objects (points), with the first such array

    var nseries=[]

    nseries.push({key:0,values:value2lines(value,coord)})

    return nseries
}


function add_nseries(nseries, value,coord){
    // add one object to an "nseries" array of key-value objects, containing arrays of 
    // x,y valued objects (points), with the first such array

    var new_key=nseries[nseries.length-1].key+1

    nseries.push({key:new_key,values:value2lines(value,coord)})

    return nseries
}


// value2lines(value,coord)

// 1D functions ----------------

function legend(div,names){

    var dh=15,
        x0=w-40,
        y0=40,
        dl=10

    var legend=div.select("svg")
        .append("g")
        .attr("class","my_flabel my_legend my_plot_axes")

    legend.selectAll("text")
        .data(names)
        .enter()
        .append("text")
        .text(function(d){console.log(d);return d;})
        .attr("x",function(d,i){return x0})
        .attr("y",function(d,i){return y0+dh*i})

    legend.selectAll("line")
          .data(names)
          .enter()
          .append("line")
          .attr({
            x1: x0-2,
            y1: function(d,i){return y0+dh*(i-0.3)},
            x2: x0-dl-2,
            y2: function(d,i){return y0+dh*(i-0.3)},
            stroke: function(d,i){return linecols[i];}
          })    
}

function handle_series(div,data){
    // in this case multiple time series have been received

    // coord0 is the experiment coord
    // coord1 is the spatial coord

    // we have access to the experiments here via the data.coord0_strings array
    
    console.log(data.coord0_strings)
   
    data=handle_nan(data,0)

    var coord=data.coord1
    // nseries is an array of key-value objects, where the value is an array of x-y objects (points)
    var nseries=init_nseries(data.value[0],coord)

    var ylabel=data.units,
        xlabel=data.coord1_lname,    
        title=data.lname;

    if (data.value.length>1){
        for (i=1;i<data.value.length;i++){
            nseries=add_nseries(nseries,data.value[i],coord)
        }
    }
//    console.log(data)
    var hndls=doPlots(div,nseries,title,xlabel,ylabel)
  
    legend(div,data.coord0_strings)  


    return hndls
}

function handle1Ds(div,data){

    data=handle_nan(data,0)
    var coord=data.coord0
    var nseries=init_nseries(data.value,coord)
 
//      ylabel=data.units,
    var ylabel='',
        xlabel=data.coord0_lname,    
        title=data.lname;

    var hndls=doPlots(div,nseries,title,xlabel,ylabel)
  
    return hndls    


}





function doPlots(div,nseries,title,xlabel,ylabel){
 // determine scales and plot series

    var MARGINS = {
        top: 30,
        right: 20,
        bottom: 35,
        left: 50
    }

    var svg=div.selectAll("svg")
    // clear any remnants of pcolors etc 
    svg.select('.my_plot').selectAll("rect").remove()

    // this canvas is not used for the plots. Instead, the following lines clear anything that's on the canvas
    // so as to not interfere with our line plots in the svg
    var canvas=div.select("canvas"),
        ctx = canvas.node().getContext("2d")
    ctx.clearRect( 0 , 0 , canvas.attr("width") , canvas.attr("height") );

    var Mm=make_axes(div,svg,nseries)

    // draw the axes
    var axob=prep_axes1Ds(div, Mm.xScale, Mm.yScale,true,true,-1,MARGINS)

    var lbls=dolabels(div,title,xlabel,ylabel,-1,MARGINS)

    var plts=plots(svg, nseries, Mm.xScale, Mm.yScale)

    return plts
}  


function plots(svg, nseries, xScale, yScale){
    // nseries is nested arrays of lineData type arrays
 // e.g. [  {key: 1, values: [{x:0, y:10} , {x:1, y:12}, … ] , key: 2, values: [{x:0,y:15} , {x:1,y:14}, … ]  ]



    var lineFunc = d3.svg.line()
                        .x(function(d) {
                            return xScale(d.x);
                        })
                        .y(function(d) {
                            return yScale(d.y);
                        })
                        .interpolate('linear');
   
    

    var curves = svg.select(".my_plot")
        .selectAll("g")
        .data(nseries)  // the nested lineData type arrays

    // the new elements
    curves.enter()  // enter only the series, not their individual points
        .append("g")  // due to nesting, key is now the series id
            .attr("class",function(d) { return "series series_"+d.key    })                 
            .style("stroke",function(d) { return linecols[d.key]    })  // stroke sets color
//            .style("opacity",0.5)
            .append("path")
                    .attr("class","line")
                    .attr('d', function(d){return lineFunc(d.values) } ); 

   // existing elements are transitioned to new values
    curves.transition()
          .duration(1000)                  
          .style("stroke",function(d) {return linecols[d.key]    })
//          .style("opacity",0.5)
          .select("path")
              .attr('d', function(d){return lineFunc(d.values) } ); 

    // elements that must be removed if new dataset is smaller than old on already displayed.
    curves.exit()
          .transition()
          .duration(500)
          .remove();

    return curves
}



function value2lines(value,coord){
    // Create an array of x,y objects from arrays value (y) and coord (x)
    var lineData = []
      
    for (var i=0;i<value.length;i++){
            
        lineData.push({x:coord[i],y:value[i]})           
    }   
    return lineData
}


function data2lines(data){

    return value2lines(data.value, data.coord0)
}



function dolabels(div,title,xlabel,ylabel,i,MARGINS){

    var svg=div.selectAll("svg")

    var w=svg.attr("width"),
        h=svg.attr("height")

    haxes=svg.select(".my_flabel")

    if (i >-1){
        title =  ' ('+String.fromCharCode(97+i) +') '+title
    }

    var htitle=haxes.append("g")
        .attr("class", "my_flabel")
        .append("text")
//      .attr("class", "x label")
        .attr("class", "my_axis my_plot_title")
      
        .attr("text-anchor", "start")
        .attr("x", MARGINS.left  )
        .attr("y", MARGINS.top -15)
        .text(title);

    var hxlabel=haxes.append("g")
                .attr("class", "my_flabel")
                .append("text")
                .attr("class", "x label my_axis")
          
                .attr("text-anchor", "end")
                .attr("x", MARGINS.left+ Math.round((w-MARGINS.left-MARGINS.right )/2))
                .attr("y", h-MARGINS.bottom+31 )
                .text(xlabel);

    var hylabel=haxes.append("g")
                .attr("class", "my_flabel")
                .append("text")
                .attr("class", "y label")
                .attr("transform", "rotate(-90)")
                .attr("y", 56)
                .attr("x", -Math.round(h/6))
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(ylabel);

    return {htitle:htitle,hxlabel:hxlabel,hylabel:hylabel}
}

function prep_axes1Ds(div, xScale,yScale,xax,yax,i,MARGINS){

    console.log(padding)

    var svg=div.selectAll("svg")

    var w=svg.attr("width"),
        h=svg.attr("height"),

        units="",
        xlabel="",    
        ylabel="",
        title="";
 
    var haxes=svg.append("g")
                .attr("class","my_flabel my_plot_axes")
            
    if (xax){ 

        var xAxis = d3.svg.axis()
                 .scale(xScale)
                 .tickSize(5)
                 .tickSubdivide(true);

    haxes.append('g')
      .attr('class', "my_x_axis my_axis")

      .attr('transform', 'translate(0,' + (h - MARGINS.bottom) + ')')
      .call(xAxis);
    } 

    if (yax){

        var yAxis = d3.svg.axis()
          .scale(yScale)
          .tickSize(5)
          .orient('left')
          .tickSubdivide(true);

        haxes.append('g')
         .attr('class', "my_y_axis my_axis")
         .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
         .call(yAxis);
    }  

//    return {svg:svg,div:div,haxes:haxes,xScale:xScale,yScale:yScale,hxlabel:hxlabel,hylabel:hylabel,htitle:htitle,i:i}

    return {svg:svg,div:div,haxes:haxes,xScale:xScale,yScale:yScale,i:i}
}






function findM4one(lineData){

    var Mx=d3.max(lineData, function(d){return d.x;}),
        mx=d3.min(lineData, function(d){return d.x;}),
        My=d3.max(lineData, function(d){return d.y;}),
        my=d3.min(lineData, function(d){return d.y;})

    return {Mx:Mx,mx:mx,My:My,my:my}    
}

function findM(nseries){

    var Mxs=[],
        mxs=[],
        Mys=[],
        mys=[]

    var Mm 

 //   var lineDatas=map(nseries).values()

    for (i=0;i<nseries.length;i++){
        Mm=findM4one(nseries[i].values)
        Mxs.push(Mm.Mx)
        mxs.push(Mm.mx)
        Mys.push(Mm.My)
        mys.push(Mm.my)
    }

    return {Mx:d3.max(Mxs),mx:d3.min(mxs),My:d3.max(Mys),my:d3.min(mys)}
}




function make_axes(div,svg,nseries){

    var svg=div.selectAll("svg")

    var w=svg.attr("width"),
        h=svg.attr("height")

    var Mm=findM(nseries)


    var MARGINS = {
        top: 30,
        right: 20,
        bottom: 30,
        left: 50
    },
    xScale = d3.scale.linear().range([MARGINS.left, w - MARGINS.right]).domain([Mm.mx,Mm.Mx]),
    yScale = d3.scale.linear().range([h - MARGINS.top, MARGINS.bottom]).domain([Mm.my, Mm.My]);

    return {xScale:xScale,yScale:yScale}
}




// 2D functions ----------------


function prep_axes(div, data,padding,wcb,xax,yax,i){
    // add labels and axes
    // create axes object axob containing information about labels and axes, including handles to entire label set and subsets

    var svg=div.selectAll("svg")

    var ycoord_edges=data.coord0_edges,
        xcoord_edges=data.coord1_edges,
        m=data.m,
        M=data.M,
        units=data.units,
        xlabel=data.coord1_lname,    
        ylabel=data.coord0_lname,
        title=data.lname;

    var w=svg.attr("width"),
        h=svg.attr("height");
        
    if (i >-1){
        title =  ' ('+String.fromCharCode(97+i) +') '+title

    }

    var haxes=svg.append("g")
             .attr("class","my_flabel")

    var htitle=haxes.append("g")
               .attr("class", "my_flabel")
               .append("text")
//      .attr("class", "x label")
               .attr("class", "my_axis")
               .attr("text-anchor", "start")
               .attr("x", padding  )
               .attr("y", 25 )
               .text(title);

    // contains array of (y,x,dy,dx,value)

 //    colours = make_cmap('standard',m,M,num_cont);

    var size_y = ycoord_edges.length-1,
        size_x = xcoord_edges.length-1
    
    
    var xpadding = 0,
        ypadding = 0,
        cellw = w/size_x - xpadding,
        cellh = h/size_y - ypadding


    var xScale = d3.scale.linear()
                         .domain([xcoord_edges[0], xcoord_edges[xcoord_edges.length-1]])
                         .range([padding, w-padding-wcb]);

    var yScale = d3.scale.linear()
                         .domain([ycoord_edges[0], ycoord_edges[ycoord_edges.length-1]])
                         .range([h-padding, padding]);  

    if (xax){

var hxlabel=haxes.append("g")
  .attr("class", "my_flabel")
.append("text")
      .attr("class", "x label my_axis")
      
      .attr("text-anchor", "end")
      .attr("x", Math.round((w  )/2 ) )
      .attr("y", h-6 )
      .text(xlabel);

        var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom");

        haxes.append("g")
           .attr("class", "my_axis")
           .attr("transform","translate(0," + (h - padding) + ")")
           .call(xAxis);              
    }else{
        var hxlabel=false
        var xAxis=false
    }

    if (yax){

    var hylabel=haxes.append("g")
            .attr("class", "my_flabel")
      .append("text")
      .attr("class", "y label")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", -Math.round((h-padding)/2))
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(ylabel);

        var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left");

        haxes.append("g")
           .attr("class", "my_axis")
           .attr("transform", "translate(" + padding + ",0)")
           .call(yAxis);      
    }else{
        var hylabel=false
        var yAxis=false
    }

    return {svg:svg,div:div,haxes:haxes,xScale:xScale,yScale:yScale,wcb:wcb,padding:padding,hxlabel:hxlabel,hylabel:hylabel,htitle:htitle,i:i}
}

// bigDiv is a hack, maybe use parent node instead
function makeUpdateCmap(data,bigDiv,num_cont,fConf){

   function func(div,map){
        
       var svg=bigDiv.select("svg")
       var canvas=bigDiv.select("canvas")
    
       var colours=make_cmap(map,data.m,data.M,num_cont);

       
       if (bigDiv.select(".plTypeDiv").select(".selpcolor")[0][0].value=='image'){
           bigDiv.select('.my_plot').selectAll("rect").remove()
           doImage(svg,canvas,data,colours) 
       }else{
           updateColors(svg,colours)
       }
  
       updateCBar(svg,colours)

       if (map !=null){
           fConf.set("cmap",map)
       }
   
   } 

    return func
}








function updateColors(svg,colours){
    var pclr=svg.select(".my_plot")
                .selectAll("rect")
                .transition()
                .duration(200)
                .attr("stroke", function(d) { return colours(d[4]);})
                .attr("fill", function(d) { return colours(d[4]);});                
}

function pcolor(svg,tuples,colours){

    var pclr = svg.select(".my_plot")
              
              .selectAll("rect")
              .data(tuples)

        pclr.enter()
            .append("rect")
            .attr("x", function(d){return d[1] })
            .attr("y", function(d){return d[0] })
            .attr("width", function(d){return d[3] })
            .attr("height",function(d){return d[2] })

            .attr("fill", function(d) { return colours(d[4]);})

            .attr("stroke", function(d) { return colours(d[4]);})
//            .on("click",function(d){console.log(d)})

        pclr.transition()
            .duration(200)
            .attr("x", function(d){return d[1] })
            .attr("y", function(d){return d[0] })
            .attr("width", function(d){return d[3] })
            .attr("height",function(d){return d[2] })
            .attr("fill", function(d) { return colours(d[4]);})
            .attr("stroke", function(d) { return colours(d[4]);});

        pclr.exit()
            .transition()
            .duration(500)
            .remove();

    return pclr   
}



function rha(div,data,fConf){
     
    // handle 2D and 3D fields

    console.log("rha")

    data = handle_nan(data,NaN)
    var svg=div.selectAll("svg")
    
    var wcb=50,
    padding=40;

    // extra control
    var destDiv=div.select(".butDiv")
              

//    var extraDiv=div.select(".extraDiv")
//                .select("fieldset")

    // calculate scales
  
    div.selectAll(".series").remove();

    if (data.ndim==3){
        // this puts the axes on the figure AND returns axob
        axob=prep_axes(div, data.slices[0],padding,wcb,true,true,-1)



  //      var fg=extraDiv.append("div")
  //                      .attr("class","form-group")

 //       fg.append("label")
//                .attr("for","cbut")
//                .attr("class","cyclebut control-label col-xs-2 col-sm-2 col-md-2")
  //              .text("Slice")

 //       console.log(fConf.fill("cycle3D","0"))

    
        // display button allowing slicing through a 3D field. Last arg initial slice
        addcycler(axob,data,display2D,destDiv,fConf.fill("cycle3D","0"),fConf)
            .attr("id","cycle3D")
            .attr("name","cycle3D")

    }else if (data.ndim==2){
        axob=prep_axes(div, data,padding,wcb,true,true,-1)
       
        elms = display2D(axob,data,fConf)
    }
 //   console.log('over here')

    var checks=axob.div.select(".mainCheck")
                   .selectAll(".checkel")
    
    var exp=false
    for (var i=0;i<checks[0].length;i++){
        if (checks[0][i].checked){
            exp=checks[0][i].value
            break
        }
    }

}



function display2D(axob,data,fConf){
    var elms=[],
        but,
        fg

    var svg=axob.svg
    var canvas=axob.div.select("canvas")

    var num_col=30,
//        destDiv=axob.div.select(".extraDiv")
//                         .select("fieldset")
        destDiv=axob.div.select(".butDiv")
                       



    // Colormap Dropdown into extraDiv fieldset

//    fg=destDiv.append("div")
//        .attr("class","tempbut form-group")


 //   fg.append("label")
//            .attr("for","cmap")
//            .attr("class","tempbut control-label col-sm-2")
//            .text("Colormap")

    makeDropdown(destDiv.append("div").attr("class","tempbut col-xs-2  col-sm-2  col-md-2"),d3.keys(cmaps),fConf.fill("cmap",""),makeUpdateCmap(data,axob.div,num_col,fConf))
    .attr("class","tempbut form-control input-sm")
    .attr("name","colormap")
    .attr("id","cmap")
    .attr("name","cmap")

    // should we use selection.node()
    var map=axob.div.select("#cmap")[0][0].value


    var colours=make_cmap(map,data.m,data.M,num_col);

    var plotType=axob.div.select(".plTypeDiv").select(".selpcolor")[0][0].value
   
    if (plotType=='image'){
        axob.svg.selectAll(".series").remove();
        axob.svg.select('.my_plot').selectAll("rect").remove()
        elms = elms.concat(doImage(svg,canvas,data,colours))
    }else{
        elms = elms.concat(doPcolor(axob,data,colours))        
    }
    axob.svg.selectAll(".my_colorbar").remove()
    elms = elms.concat(colorbar(axob.svg,data.m,data.M,30, axob.wcb,axob.padding,data.units,colours) );

//    fg=destDiv.append("div")
//        .attr("class","tempbut form-group")

    // add toggle for contour overlay
//    var lbl=fg.append("label")
//            .attr("for","contog")
//            .attr("class","tempbut control-label col-xs-2 col-sm-2 col-md2")
//            .text("Contours")


console.log(data)

    d3.json(prep_url(fConf.fill("project"),'P__'+data.expname+'__$kmt$',ops="nop"),function(error,data){
    if (error){ return console.warn(error)};


    addtoggle(axob,destDiv,data,my_kmt,"hiddenKmt","No Geogr","geography","click", fConf,"kmt")
                     .attr("id","kmt")
                    .attr("name","kmt")
                     .attr("class","btn btn-default tempbut")
    })
 
    elms = elms.push(addtoggle(axob,destDiv,data,handle_more_data,"hiddenCont","Conts off","Contours","click",fConf,"contog" )
               .attr("id","contog").attr('name','contog').attr("class","btn btn-default  tempbut"))

    return elms
}



function toggle(w,axob,data,but,func,onms,offms,hiddenF){

    if (w==false){
        but.text(onms)
        hiddenF.attr("value","True")
        return func(axob,data);
    }else{
        w.remove()
        but.text(offms)
        hiddenF.attr("value","False")        
        return false
    }    
};

function addtoggle(axob,controlDiv,data,func,hiddenFid,onms,offms,action,fConf,Item){
    // adds interactive element to toggle content of div

    var w,
        but  // interactive element handle
    // data available in namespace
 //   var offms="contours",
 //       onms="remove conts";
//    but=controlDiv.append(tag)
//            .attr("class","tempbut")

    var initBool=fConf.fill(Item ,false)


    but=controlDiv.append("button")

            .attr("type","button")
     //       .attr("value","False")
            .attr("class","tempbut")
            .text(offms)


    var hiddenF=controlDiv.append("input")
                         .attr("type","hidden")
                         .attr("value","False")
                         .attr("id",hiddenFid)
                        .attr("name",hiddenFid)
                        .attr("class","tempbut")

    if (initBool){
        w=toggle(false,axob,data,but,func,onms,offms,hiddenF)
        hiddenF.attr("value","True")
        but.text(onms)
        but.on(action,function(d){
            // need to wrap toggle var w inside here:
                w=toggle(w,axob,data,but,func,onms,offms,hiddenF)
                     if (Item !=null){
                      
                        fConf.set(Item,(w!=false))
                    }
            
                but.on(action,function(d){
                    w=toggle(w,axob,data,but,func,onms,offms,hiddenF)   
                     if (Item !=null){
                      
                        fConf.set(Item,(w!=false))
                    }
                });
            }) 
    }else{        
        but.on(action,function(d){
            // need to wrap toggle var w inside here:
                w=toggle(false,axob,data,but,func,onms,offms,hiddenF)
                     if (Item !=null){
                      
                        fConf.set(Item,(w!=false))
                    }            
                but.on(action,function(d){
                    w=toggle(w,axob,data,but,func,onms,offms,hiddenF)   
                    if (Item !=null){
                      
                        fConf.set(Item,(w!=false))
                    }
            });
        })
    }

    return but
}



function remhandles(handles){
    
    for (var i=0;i<handles.length;i++){
        try{
            handles[i].remove()
        }catch(err){

        }
    }
}

function cycler(w,wmax,axob,data,but,func,fConf){
 
    w=(w+1)%wmax

    console.log(w)
    console.log(wmax)
    console.log(data.slices[w])

    but.text("slice "+data.scoord[w])

    but.select("input")
       .attr("value",w)
    return [w,func(axob,data.slices[w],fConf)]

};


function addcycler(axob,data,func,div,initSlice,fConf){
   // adds an element such as button to cycle through 3D field 
   // tag is usually "button"
   // func is usually display2D

    var w,
        clr,
        wmax=data.slices.length,
        but

    var subDiv=div

    but=subDiv.append("button")
              .attr("type","button")
              .attr("id","cbut")
    but.attr("class","cyclebut btn btn-default")
//        .text("cycle from "+ data.scoord[0]) 

    var valueFld=subDiv.append("input")
       .attr("type","hidden")

    if (isNaN(initSlice)){initSlice=0}

            // need to wrap cycler var w inside here:
    clr=cycler(initSlice-1,wmax,axob,data,but,func,fConf)
    w=clr[0]
    
    valueFld.attr("value",w)

    but.on("click",function(d){
 
        remhandles(clr[1])
        // unfortunate hack:
        axob.svg.selectAll(".my_contplot").remove()
        axob.svg.selectAll(".my_clabel").remove()
        axob.div.selectAll(".tempbut").remove()

        clr=cycler(w,wmax,axob,data,but,func,fConf);
        w=clr[0]   
        valueFld.attr("value",w)            
    });

    return valueFld
}


function my_kmt(axob,data){

   // data = handle_nan(data);
    data.lname =''


    var w=axob.svg.attr("width")
    var h=axob.svg.attr("height")
 
    return plot_contour(axob.svg,d3.transpose(data.value),data.coord0,data.coord1,axob.xScale,axob.yScale,data.m,data.M,12, [0.5], false);
  
};


function doImage(svg,canvas,data,colours){

//    var colours=make_cmap('GreenYellow',data.m,data.M,24),

    var imageObj = new Image();

    xmax = data.value[0].length,
    ymax = data.value.length;

    var xsc = d3.scale.linear()
        .domain([data.coord1[0], data.coord1[data.coord1.length-1]])
        .range([0, xmax]);


    var ysc = d3.scale.linear()
        .domain([data.coord0[0], data.coord0[data.coord0.length-1]])
        .range([ymax,0]);

    canvas.attr("width", xmax)
        .attr("height", ymax)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(drawImage);

//  console.log(data.coord0)
  // Compute the pixel colors; scaled by CSS.
    function drawImage(canvas) {
        var i,j

        var ctx = canvas.node().getContext("2d");
        var img = ctx.createImageData(xmax, ymax);
        for (var y = 0, p = -1; y < ymax; ++y) {
            for (var x = 0; x < xmax; ++x) {
                i=Math.min(Math.round(xsc(data.coord1[x])), xmax-1 )
                j=Math.min(Math.round(ysc(data.coord0[y])),ymax-1 )

 //               console.log(i)

 //               console.log(j)

                var c = d3.rgb(colours(data.value[j][i]));
                img.data[++p] = c.r;
                img.data[++p] = c.g;
                img.data[++p] = c.b;
                img.data[++p] = 255;
            }
//        console.log(j + ', ' +y)
        }
        ctx.putImageData(img, 0, 0);
        imageObj.src = canvas.node().toDataURL();
    }

    return []
}

function doPcolor(axob,data,colours){
 
    // cast data as tuples to be used in pcolor
    tuples = data2rectangles(data,axob.xScale,axob.yScale)

 //   var colours=make_cmap('Jetlight',data.m,data.M,24);
    var pclr=pcolor(axob.svg,tuples,colours)



    return [pclr,]             
};

function prep_url(project,varname,ops){
    var opstr=''

    if (ops !="nop"){
        opstr='?ops='+ops
    }

    return '/sgdata/'+project+'/' + varname+'/ops/'+opstr
}


//svg, data.coord0_edges,data.coord1_edges,data.m,data.M,padding,wcb,true,true,data.units,data.coord1_lname,data.coord0_lname,data.lname,-1


function updateCBar(svg,colours){
    var pclr=svg.select(".my_colorbar")
                .selectAll("rect")
                .transition()
                .duration(200)
                .attr("fill", function(d){return colours(d)})
                .attr("stroke", function(d) { return colours(d);})          
}

function colorbar(svg,m,M,boxes,wcb,padding,units,colours){

    if (wcb==0){
        return
    }

    var w=svg.attr("width"),   
        h=svg.attr("height"),
        bh = h/boxes,
//        cstep = (M-m)/boxes,
//        zs = d3.range(m,M,cstep),

        contl=find_conts(m,M,boxes)
        zs=contl.range,
        zs_str=cont2str(zs,1),
        from_fig = 5,
        from_bar =3,
        portion = 0.4,
        yticks = 6,
        axpos=w-padding,
        modulus = Math.round(boxes/yticks)
  
  
    var yScale=d3.scale.ordinal()
                  .domain(d3.range(zs.length)  )
                  .rangeRoundBands([h-padding,padding],0.01);

// 0.6 portion for text
    var cbar = svg.append("g")
                  .attr("class", "my_colorbar")

    var body=cbar.append("g")       
       .selectAll("rect")
       .data(zs)
       .enter()
       .append("rect")
       .attr("x", w-wcb-padding + from_fig)
       .attr("y", function(d,i){return yScale(i)})
       .attr("width",portion*wcb)
       .attr("height",yScale.rangeBand())
       .attr("fill", function(d){return colours(d)})
       .attr("stroke", function(d) { return colours(d);})
  //      var yAxis = d3.svg.axis()
 //                     .scale(yScale)
 //                     .orient("right");

 //       svg.append("g")
 //          .attr("class", "my_axis")
 //          .attr("transform", "translate(" + axpos + ",0)")
 //          .call(yAxis);      

       
    
    var labels = cbar.append("g")
       .attr("class", "my_colorbar")
       .selectAll("text")
       .data(zs)
       .enter()
       .append("text") 
       .text(function(d,i){
            if (i%modulus == 0){return cont2str([contl.om*d],1)[0]} return ''
       })
       .attr("x", w -(1-portion)*wcb -padding + from_fig +from_bar)
       .attr("y", function(d,i){return yScale(i)})

    if (units !='h'){
        cbar.append("g")
          .attr("class", "my_flabel")
              .append("text")
              .attr("class", "y label")
              .attr("transform", "rotate(-90)")
              .attr("y", w-padding+20)
              .attr("x", -Math.round((h-padding)/2))
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text(units);
}

       
    return cbar
    
}



function plot_contour(svg,data,ycoord,xcoord,xScale,yScale,m,M, num_cont, conts, labels ){
 
     // d3 employs chain syntax. Example: d3.select("body").append("p").text("New paragraph!");

     // .select("body") — Give select() a CSS selector as input, and it will return a reference to the first element in the DOM that matches.
     // append(), in turn, hands down a reference to the new element it just created.
     //  .text puts the text inside the tags of the DOM element just handed to it.

     // Typically, a method returns a reference to the element that it just acted upon, but not always. 


    // d3.range creates an array [a1,a2,...] of values for zs much like Python arange 

    // scales are functions that map from an input domain to an output range.
    // The scale has additional methods that change its behavior. 
    // A scale object, such as that returned by d3.scale.linear, is both an object and a function. 

    // Like other classes in D3, scales follow the method chaining pattern where setter methods return the scale itself.


    console.log(xcoord[0])
    var w=svg.attr("width")
    var h=svg.attr("height")
    
    // initialize Conrec object with specific data
    var c = new Conrec(),
        zs,
        om
    
    if ( conts == false){
        contl=find_conts(m,M,num_cont)
       
        zs=cont2str(contl.range,1)
        om=contl.om

     //   cont_step = (M-m)/num_cont;
     //   zs = d3.range(m , M , cont_step);       
    }else{
     
        zs=conts;
        om=1.
    }
 
    // call contour method on existing Conrec object
    c.contour(data, 0, xcoord.length-1, 0, ycoord.length-1, xcoord, ycoord, zs.length, zs);
   
    // nesting the c.contourList() according to level and feed as data to d3

    nested = d3.nest().key(function(d) { return d.level}).entries(c.contourList())

    // created contour labels
    var lbpos = [],
        cont_i1 = 0,
        lbl;
    //    cont_i2 = 0;

    
    for (var i=0;i<nested.length;i++){
        for (var j=0;j<nested[i].values.length;j++){
            cont_i1 =  Math.floor((nested[i].values[j].length)*Math.random() )
    //        cont_i2 = Math.round(nested[i].values[j].length*3/4)

            lbl = om*parseFloat(nested[i].key )

            if (Math.abs(lbl)<0.1 || Math.abs(lbl)>99){
                lbl=parseFloat(lbl).toExponential(1)
            }else{
                if (lbl == Math.round(lbl)){
                    lbl=lbl.toFixed(0)

                }else{
                    lbl=lbl.toFixed(1)
                }
            }


            lbpos.push( [nested[i].values[j][cont_i1].x,nested[i].values[j][cont_i1].y,  lbl    ]  )

        }
    }
    
    var allcont = svg.append("g")  
    
    var contplot = allcont.append("g")
        .attr("class","my_contplot")
        .selectAll("g")
        .data( nested )
        .enter()
        .append("g")  // due to nesting, key is now the level
            .attr("class",function(d) { return "level_"+d.key})
    //        .style("fill",function(d) { console.log(d.key);return colours(d.key);})
   //         .style("fill",function(d) { return colours(d.key);}) 
            .style("fill","none")                       
            .style("stroke","black")
            .style("opacity",0.5)


    var conts = contplot.append("g")
                .selectAll("path")
                .data(function(d) { return d.values}) // note function in data method
                .enter()
          
                .append("svg:path")
                    .attr("d",d3.svg.line()  // this function is an iterator!
                        .x(function(d) { return xScale(d.x)})
                        .y(function(d) { return yScale(d.y)})
                        )


    if (labels){
        var clabels = allcont.append("g")
                .attr("class","my_clabel")
                .attr("clip-path","url(#p-area)")
                .selectAll("text")
                .data(lbpos) // note function in data method
                .enter()          
                .append("text")
               
                .text(function(d,i){
                        return d[2]

                   })
                .attr("x", function(d) { return xScale( d[0]  )} )
                .attr("y", function(d) { return yScale(d[1])} )

    }

    return allcont
}

function ordermag(val){
    // calculate the 10-log of val and substract 2
    var expon=Math.round(Math.log(Math.abs(val))/Math.LN10-2),
        sign = val/Math.abs(val)

    // return abs value divided 10^expon
    return [Math.abs(val)/Math.pow(10, expon ), expon, sign]
}

function toOrdermag(val,ord){

    return Math.round(val/Math.pow(10,ord))*Math.pow(10,ord)
}

function cont2str(conts,decs){

    var lbl=0,
        strconts=[];

    for (var i=0;i<conts.length;i++){
        lbl = parseFloat(conts[i]);


        if ((Math.abs(lbl) > 100) || (Math.abs(lbl) < 0.01)){
          lbl=lbl.toExponential(1)
          

        }else if (lbl == Math.round(lbl)){
            lbl=lbl.toFixed(0)

        }else{
            lbl=lbl.toFixed(decs)
        }

        strconts.push(lbl)
    }
    return strconts
}

            
function find_conts(m,M,num_cont){            
  
  // finds convenient as round as possible contour values
      
        var om=ordermag(M-m),
            retOm

        
        if (om[1] <= -2){
            var cont_step=(M-m)/num_cont

    //        console.log(m+'..'+M+'..'+cont_step)
      
            return {range:d3.range(m,M,cont_step) , om:1}

        }

        var dMM=om[0],
            omag=om[1],
            mm=toOrdermag(m,omag),
            MM=toOrdermag(M,omag),

     //       cont_step=toOrdermag(Math.round( (MM-mm)/num_cont ),omag)

           // This is a hack! to be fixed.

           cont_step=toOrdermag(Math.round( (MM-mm)/num_cont ),omag) 
           if (cont_step==0){
               cont_step=(M-m)/num_cont
           }

    //        cont_step=toOrdermag( (M-m)/num_cont ,om)

        console.log('omag '+omag + '  num_cont: ' + num_cont)
        console.log('baba ' + mm + '.. ' + dMM + ' .. '+MM + '.. ' + cont_step)
//        console.log('yaga ' + Math.floor(mm) + '.. ' + dMM + ' .. '+Math.ceil(MM) + '.. ' + cont_step)

        if (omag >10 || omag<-10){
            
            retOm=Math.pow(10,-omag)
        }else{
            retOm=1. 
        }
        console.log('retOm: '+retOm)
            
        return {range:d3.range(Math.floor(mm),Math.ceil(MM),cont_step) , om:retOm}


}


function make_cmap(map_name,m,M,num_cont){
    
    if (map_name == 'W'){
        return function (d){

            if (isNaN(d)){
                return 'black'
            }else{
                return 'white'
            }
        }
    }

    if (num_cont==0){
        var cmap = cmaps[map_name],
            step,
            zs_set;
      
        if (m<0 && M>0 && (['BWR','BluesReds'].indexOf(map_name)>-1  )){
            step = -2*m/(cmap.length-1)
            var step2=2*M/(cmap.length-1)
            zs_set = d3.range(m,0. ,step).concat(d3.range(0.,M  ,step2).concat([parseFloat(M)]));
  //          console.log(0.1*step2)
  //          console.log(d3.range(0.,M  ,step2).concat([parseFloat(M)]) )
        }else{
            step = (M - m)/ (cmap.length )
            zs_set = d3.range(m,M ,step);
        }

  //      zs_set=[parseFloat(10*m)].concat( zs_set)
  //      cmap = ['black'].concat(cmap)
        return d3.scale.linear().domain(zs_set).range(cmap);
    }
    else{


        var linmap=make_cmap(map_name,m,M,0);
    
        var zs_set=find_conts(m,M,num_cont).range,
            imzs=[];

        
        for (var i=0;i<zs_set.length;i++){

            imzs.push(linmap(zs_set[i]))
        }
 
        var mapf=d3.scale.quantize().domain([m,M]).range(imzs);

        return function (d){

            if (isNaN(d)){
                return 'grey'
            }else{
                return mapf(d)
            }
        }
    }
};
 

function get_grid(data){
 
    var ycoord = data.grid.members[0].value 
    var xcoord = data.grid.members[1].value

    for (var i=0;i<xcoord.length;i++){
        xcoord[i] = xcoord[i] - 90.
    }

    var spacingX = xcoord[1] - xcoord[0];
    var spacingY = ycoord[1] - ycoord[0];
   
    var maxY = ycoord[ycoord.length-1]
    var minY = ycoord[0]

    var maxX = xcoord[xcoord.length-1]
    var minX = xcoord[0]

    console.log("spacingX: " + spacingX +"  spacingY: "+spacingY)

    console.log("Mx = "+maxX+"  mx = "+minX+"  My = "+maxY+"  my = "+minY + " => " +(maxX-minX)/spacingX+":"+(maxY-minY)/spacingY);

    console.log('Length of data is '+data.value.length)
    var new_data = prepare_data(data, xcoord, ycoord);

    var grid = make_grid(new_data, maxX, minX, maxY, minY, spacingX, spacingY)
 

    return {grid:grid, maxX:maxX,minX:minX, maxY:maxY, minY:minY   }
}

function make_grid(data, maxX, minX, maxY, minY, spacingX, spacingY){

 

    // The data is provided as an array of [lat, lon, value] arrays and it need to be mapped to a grid.
    // Determine the min and max latitudes and longitudes
 
   
    var grid_len_x = Math.round( (maxX-minX)/spacingX+1 )
    var grid_len_y = Math.round( (maxY-minY)/spacingY+1 )
    console.log("grid len X: " + grid_len_x)
     

    // Create a properly dimensioned array
    var grid=new Array( grid_len_x);

 
    for (var i=0;i<grid.length;i++)
        grid[i] = Array( grid_len_y );
            
    
    // Fill the grid with the values from the data array
    data.forEach(function(val){grid[Math.round((val[1]-minX)/spacingX)][Math.round( (val[0]-minY)/spacingY ) ]=val[2];});
            
    //Add a "cliff edge" to force contour lines to close along the border.          
    grid = make_cliff(grid);

   
   
    return grid
}

function make_cliff(grid){

    var cliff = -400;
    grid.push(d3.range(grid[0].length).map(function() { return cliff; }));
    grid.unshift(d3.range(grid[0].length).map(function() { return cliff; }));
    grid.forEach(function(nd) {
        nd.push(cliff);
        nd.unshift(cliff);
    });
   
    return grid
}

function data2xyvalue(data,xcoord,ycoord){
    // Returns a 2D grid as one array of 3-tuples of (y,x,value)
    //

    new_data = []
    for (var j=0;j<data.length;j++){
                        
        var row = data[j];
        for (var i=0;i<row.length;i++){
            var new_item = [ycoord[j],xcoord[i],row[i]]

            new_data.push(new_item)
        }
    }
return new_data;
}


function data2rectangles(data,xScale,yScale){
    // Takes a 2D grid and returns one array of 5-tuples of (y,x,dy,dx,value). Coords in xScale and yScale
    // to be used to draw rectangles, with x,y the upper left corner and dy,dx the widths.


    var ycoord_edges=data.coord0_edges,
        xcoord_edges=data.coord1_edges;
     
  
    new_data = []
    for (var j=0;j<data.value.length;j++){
                        
        var row = data.value[j];
        for (var i=0;i<row.length;i++){
            var new_item = [yScale(ycoord_edges[j+1]),xScale(xcoord_edges[i]),Math.ceil(yScale(ycoord_edges[j])-yScale(ycoord_edges[j+1])),Math.ceil(xScale(xcoord_edges[j+1])-xScale(xcoord_edges[j]) ),row[i]]

            new_data.push(new_item)
        }
    }
return new_data;
}

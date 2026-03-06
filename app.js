let rawData=[]

Papa.parse("./data/issues.csv",{

download:true,
header:true,

complete:function(results){

rawData=results.data.filter(r=>r.Criado)

prepareData()

}

})

function prepareData(){

rawData.forEach(d=>{

d.criado=new Date(d.Criado)

if(d.Atualizado)
d.atualizado=new Date(d.Atualizado)

})

renderDashboard()

}

function renderDashboard(){

let total=rawData.length

let resolvidos=rawData.filter(d=>
d.Status==="Concluído" ||
d.Status==="Resolvido"
)

let backlog=total-resolvidos.length

document.getElementById("totalChamados").innerText=total
document.getElementById("backlog").innerText=backlog

calcularMTTR(resolvidos)

calcularSLA(resolvidos)

statusChart()

prioridadeChart()

mesChart()

rankingTecnicos()

heatmapSemanal()

heatmapMensal()

}

function calcularMTTR(data){

let horas=0

data.forEach(d=>{

if(d.atualizado){

let diff=(d.atualizado-d.criado)/3600000

horas+=diff

}

})

let mttr=(horas/data.length).toFixed(1)

document.getElementById("mttr").innerText=mttr+"h"

}

function calcularSLA(data){

let dentroSLA=0

data.forEach(d=>{

let diff=(d.atualizado-d.criado)/3600000

if(diff<=48) dentroSLA++

})

let sla=((dentroSLA/data.length)*100).toFixed(1)

document.getElementById("sla").innerText=sla+"%"

}

function group(column){

let map={}

rawData.forEach(d=>{

let k=d[column]||"N/A"

map[k]=(map[k]||0)+1

})

return map

}

function barChart(canvas,data){

new Chart(document.getElementById(canvas),{

type:"bar",

data:{

labels:Object.keys(data),

datasets:[{

data:Object.values(data)

}]

},

options:{plugins:{legend:{display:false}}}

})

}

function statusChart(){

barChart("statusChart",group("Status"))

}

function prioridadeChart(){

barChart("prioridadeChart",group("Prioridade"))

}

function rankingTecnicos(){

barChart("tecnicosChart",group("Responsável"))

}

function mesChart(){

let map={}

rawData.forEach(d=>{

let m=d.criado.toISOString().slice(0,7)

map[m]=(map[m]||0)+1

})

barChart("mesChart",map)

}

function heatmapSemanal(){

let matrix=[[],[],[],[],[]]

rawData.forEach(d=>{

let week=Math.ceil(d.criado.getDate()/7)-1

let day=d.criado.getDay()

matrix[week][day]=(matrix[week][day]||0)+1

})

Plotly.newPlot("heatmapSemanal",[{

z:matrix,
type:"heatmap"

}])

}

function heatmapMensal(){

let map={}

rawData.forEach(d=>{

let m=d.criado.getMonth()

map[m]=(map[m]||0)+1

})

Plotly.newPlot("heatmapMensal",[{

z:[Object.values(map)],
type:"heatmap"

}])

}

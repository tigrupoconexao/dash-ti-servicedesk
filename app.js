let rawData = []

Papa.parse("data/issues.csv",{

download:true,
header:true,
delimiter:";",

complete:function(results){

rawData = results.data

rawData.forEach(d=>{
d.Criado = new Date(d.Criado)
})

initFilters()

renderDashboard(rawData)

}

})

function initFilters(){

createFilter("statusFilter","Status")
createFilter("tipoFilter","Tipo de item")
createFilter("dominioFilter","Campo personalizado (Domínio de TI - Atuação)")

}

function createFilter(id,column){

let select=document.getElementById(id)

let values=[...new Set(rawData.map(d=>d[column]))]

select.innerHTML="<option value=''>Todos</option>"

values.forEach(v=>{

let op=document.createElement("option")
op.value=v
op.text=v
select.appendChild(op)

})

}

function applyFilters(){

let status=document.getElementById("statusFilter").value
let tipo=document.getElementById("tipoFilter").value
let dominio=document.getElementById("dominioFilter").value

let inicio=document.getElementById("dataInicio").value
let fim=document.getElementById("dataFim").value

let data=rawData.filter(d=>{

if(status && d.Status!==status) return false
if(tipo && d["Tipo de item"]!==tipo) return false
if(dominio && d["Campo personalizado (Domínio de TI - Atuação)"]!==dominio) return false

if(inicio && new Date(d.Criado)<new Date(inicio)) return false
if(fim && new Date(d.Criado)>new Date(fim)) return false

return true

})

renderDashboard(data)

}

function renderDashboard(data){

let total=data.length

let resolvidos=data.filter(d=>["Concluído","Resolvido"].includes(d.Status)).length

let abertos=total-resolvidos

let taxa=((resolvidos/total)*100).toFixed(1)

document.getElementById("kpiTotal").innerText=total
document.getElementById("kpiResolvidos").innerText=resolvidos
document.getElementById("kpiAbertos").innerText=abertos
document.getElementById("kpiTaxa").innerText=taxa+"%"

createBarChart("statusChart",groupCount(data,"Status"),"Status")

createBarChart("prioridadeChart",groupCount(data,"Prioridade"),"Prioridade")

createBarChart("tipoChart",groupCount(data,"Tipo de item"),"Tipo")

createBarChart("dominioChart",groupCount(data,"Campo personalizado (Domínio de TI - Atuação)"),"Domínio TI")

createMesChart(data)

createHeatmapSemanal(data)

createHeatmapMensal(data)

}

function groupCount(data,column){

let map={}

data.forEach(d=>{

let k=d[column]

map[k]=(map[k]||0)+1

})

return map

}

function createBarChart(canvas,data,label){

new Chart(document.getElementById(canvas),{

type:"bar",

data:{

labels:Object.keys(data),

datasets:[{

label:label,

data:Object.values(data)

}]

}

})

}

function createMesChart(data){

let map={}

data.forEach(d=>{

let mes=d.Criado.toISOString().slice(0,7)

map[mes]=(map[mes]||0)+1

})

createBarChart("mesChart",map,"Chamados por mês")

}

function createHeatmapSemanal(data){

let matrix=[[],[],[],[],[]]

data.forEach(d=>{

let w=Math.ceil(d.Criado.getDate()/7)-1
let day=d.Criado.getDay()

matrix[w][day]=(matrix[w][day]||0)+1

})

Plotly.newPlot("heatmapSemanal",[{

z:matrix,
type:"heatmap"

}])

}

function createHeatmapMensal(data){

let map={}

data.forEach(d=>{

let m=d.Criado.getMonth()

map[m]=(map[m]||0)+1

})

let z=[Object.values(map)]

Plotly.newPlot("heatmapMensal",[{

z:z,
type:"heatmap"

}])

}

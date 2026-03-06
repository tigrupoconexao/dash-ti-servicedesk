let rawData = []

let charts = []

Papa.parse("./data/issues.csv",{

download:true,
header:true,

complete:function(results){

rawData = results.data.filter(r => r.Criado)

rawData.forEach(d=>{
d.Criado = new Date(d.Criado)
})

initFilters()

renderDashboard(rawData)

},

error:function(err){

console.error("Erro ao carregar CSV:",err)

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

charts.forEach(c=>c.destroy())
charts=[]

let total=data.length

let resolvidos=data.filter(d=>["Concluído","Resolvido"].includes(d.Status)).length

let abertos=total-resolvidos

let taxa= total ? ((resolvidos/total)*100).toFixed(1) : 0

document.getElementById("kpiTotal").innerText=total
document.getElementById("kpiResolvidos").innerText=resolvidos
document.getElementById("kpiAbertos").innerText=abertos
document.getElementById("kpiTaxa").innerText=taxa+"%"

createBarChart("statusChart",groupCount(data,"Status"))
createBarChart("prioridadeChart",groupCount(data,"Prioridade"))
createBarChart("tipoChart",groupCount(data,"Tipo de item"))
createBarChart("dominioChart",groupCount(data,"Campo personalizado (Domínio de TI - Atuação)"))

createMesChart(data)

createHeatmapSemanal(data)

createHeatmapMensal(data)

}

function groupCount(data,column){

let map={}

data.forEach(d=>{
let k=d[column] || "Não informado"
map[k]=(map[k]||0)+1
})

return map

}

function createBarChart(canvas,data){

let chart = new Chart(document.getElementById(canvas),{

type:"bar",

data:{

labels:Object.keys(data),

datasets:[{

data:Object.values(data)

}]

},

options:{
plugins:{
legend:{display:false}
}
}

})

charts.push(chart)

}

function createMesChart(data){

let map={}

data.forEach(d=>{

let mes=d.Criado.toISOString().slice(0,7)

map[mes]=(map[mes]||0)+1

})

createBarChart("mesChart",map)

}

function createHeatmapSemanal(data){

let matrix=[[],[],[],[],[]]

data.forEach(d=>{

let week=Math.ceil(d.Criado.getDate()/7)-1
let day=d.Criado.getDay()

if(!matrix[week]) matrix[week]=[]

matrix[week][day]=(matrix[week][day]||0)+1

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

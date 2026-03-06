let data = []

Papa.parse("./data/issues.csv", {
  download: true,
  header: true,
  complete: function (results) {

    data = results.data.filter(r => r.Criado)

    data.forEach(d => {

      d.criado = new Date(d.Criado)

      if (d.Atualizado)
        d.atualizado = new Date(d.Atualizado)

    })

    renderDashboard()

  }
})


function renderDashboard() {

  kpis()

  statusChart()

  prioridadeChart()

  tecnicosChart()

  tendenciaIncidentes()

  heatmapHora()

  backlogAging()

  detectarPicos()

  calcularMTTR()

  calcularMTTA()

}



function kpis(){

let total=data.length

let resolvidos=data.filter(d=>
d.Status=="Concluído" || d.Status=="Resolvido"
)

let backlog=total-resolvidos.length

document.getElementById("totalChamados").innerText=total
document.getElementById("backlog").innerText=backlog

}



function group(column){

let map={}

data.forEach(d=>{

let k=d[column] || "Não informado"

map[k]=(map[k]||0)+1

})

return map

}



function createChart(canvas,title,dataMap){

new Chart(document.getElementById(canvas),{

type:'bar',

data:{

labels:Object.keys(dataMap),

datasets:[{

label:title,

data:Object.values(dataMap),

backgroundColor:"#3b82f6"

}]

},

options:{

plugins:{
legend:{display:true}
},

scales:{
y:{beginAtZero:true}
}

}

})

}



function statusChart(){

createChart(
"statusChart",
"Chamados por Status",
group("Status")
)

}



function prioridadeChart(){

createChart(
"prioridadeChart",
"Chamados por Prioridade",
group("Prioridade")
)

}



function tecnicosChart(){

createChart(
"tecnicosChart",
"Ranking Técnicos",
group("Responsável")
)

}



function tendenciaIncidentes(){

let map={}

data.forEach(d=>{

let mes=d.criado.toISOString().slice(0,7)

map[mes]=(map[mes]||0)+1

})

new Chart(document.getElementById("mesChart"),{

type:'line',

data:{

labels:Object.keys(map),

datasets:[{

label:"Tendência de Incidentes",

data:Object.values(map),

borderColor:"#22c55e",

fill:false

}]

}

})

}



function calcularMTTR(){

let resolvidos=data.filter(d=>
d.Status=="Resolvido" || d.Status=="Concluído"
)

let horas=0

resolvidos.forEach(d=>{

if(d.atualizado){

horas+=(d.atualizado-d.criado)/3600000

}

})

let mttr=(horas/resolvidos.length).toFixed(1)

document.getElementById("mttr").innerText=mttr+"h"

}



function calcularMTTA(){

let horas=0
let count=0

data.forEach(d=>{

if(d.atualizado){

horas+=(d.atualizado-d.criado)/3600000
count++

}

})

let mtta=(horas/count).toFixed(1)

document.getElementById("mtta").innerText=mtta+"h"

}



function heatmapHora(){

let horas=Array(24).fill(0)

data.forEach(d=>{

let h=d.criado.getHours()

horas[h]++

})

new Chart(document.getElementById("heatmapHora"),{

type:'bar',

data:{

labels:[...Array(24).keys()],

datasets:[{

label:"Chamados por hora",

data:horas,

backgroundColor:"#f59e0b"

}]

}

})

}



function backlogAging(){

let aging={

"0-24h":0,
"1-3 dias":0,
"3-7 dias":0,
"+7 dias":0

}

let agora=new Date()

data.forEach(d=>{

if(d.Status!="Resolvido" && d.Status!="Concluído"){

let diff=(agora-d.criado)/86400000

if(diff<1) aging["0-24h"]++
else if(diff<3) aging["1-3 dias"]++
else if(diff<7) aging["3-7 dias"]++
else aging["+7 dias"]++

}

})

createChart("agingChart","Aging Backlog",aging)

}



function detectarPicos(){

let map={}

data.forEach(d=>{

let dia=d.criado.toISOString().slice(0,10)

map[dia]=(map[dia]||0)+1

})

let valores=Object.values(map)

let media=valores.reduce((a,b)=>a+b)/valores.length

let pico=Math.max(...valores)

document.getElementById("picoChamados").innerText=pico

}

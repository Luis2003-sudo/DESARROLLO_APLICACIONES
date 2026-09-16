const $=id=>document.getElementById(id);
const appPage=$('appPage'),trabajoForm=$('trabajoForm'),btnAdmin=$('btnAdmin'),adminLoginPage=$('adminLoginPage'),adminLoginForm=$('adminLoginForm'),adminUsuario=$('adminUsuario'),adminPassword=$('adminPassword'),btnCancelarAdmin=$('btnCancelarAdmin'),adminPage=$('adminPage'),btnVolver=$('btnVolver'),adminForm=$('adminForm'),adminUnidad=$('adminUnidad'),adminSemana=$('adminSemana'),adminTexto=$('adminTexto'),adminContenidoLista=$('adminContenidoLista'),trabajosContainer=$('trabajosContainer'),unidadesContainer=$('unidadesContainer'),totalTrabajos=$('totalTrabajos'),emptyMessage=$('emptyMessage'),buscar=$('buscar'),filtroUnidad=$('filtroUnidad'),filtroSemana=$('filtroSemana'),limpiarFiltros=$('limpiarFiltros'),btnVerTareas=$('btnVerTareas'),btnMiPerfil=$('btnMiPerfil'),enlacesContainer=$('enlacesContainer'),btnAgregarEnlace=$('btnAgregarEnlace'),modalAdjuntos=$('modalAdjuntos'),modalTitulo=$('modalTitulo'),modalSubtitulo=$('modalSubtitulo'),modalLista=$('modalLista'),btnCerrarModal=$('btnCerrarModal'),modalArchivos=$('modalArchivos'),modalEnlacesContainer=$('modalEnlacesContainer'),modalBtnAgregarEnlace=$('modalBtnAgregarEnlace'),modalBtnGuardarMas=$('modalBtnGuardarMas');
const adminCorrecto='admin@campus.com',passwordAdminCorrecto='admin_2003';

const SUPABASE_URL='https://moanobzutufwhucxiurm.supabase.co';
const SUPABASE_KEY='sb_publishable_qeneiL045GECbtOIFWhslA_p7qE8GMY';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

let trabajos=[];
let trabajoActualId=null;
let textosSemanas=JSON.parse(localStorage.getItem('textosSemanasCampus'))||{};

async function cargarTrabajos(){
  const {data,error}=await sb.from('trabajos').select('*').order('fecha',{ascending:false});
  if(error){console.error('Error al cargar trabajos:',error);return;}
  trabajos=data||[];
  renderizarTodo();
}

function semanaGlobal(u,s){return(Number(u)-1)*4+Number(s)}
function clave(u,s){return`unidad_${u}_semana_${s}`}
function textoSemana(u,s){return textosSemanas[clave(u,s)]||''}
function guardarTextos(){localStorage.setItem('textosSemanasCampus',JSON.stringify(textosSemanas))}

function mostrarApp(){adminLoginPage.classList.add('hidden');adminPage.classList.add('hidden');appPage.classList.remove('hidden');cargarTrabajos()}

mostrarApp();

function agregarFilaEnlace(container,nombre='',url=''){
  const row=document.createElement('div');
  row.className='enlace-row';
  const inputNombre=document.createElement('input');
  inputNombre.placeholder='Nombre del enlace';
  inputNombre.className='enlace-nombre';
  inputNombre.value=nombre;
  const inputUrl=document.createElement('input');
  inputUrl.type='url';
  inputUrl.placeholder='https://...';
  inputUrl.className='enlace-url';
  inputUrl.value=url;
  const btnQuitar=document.createElement('button');
  btnQuitar.type='button';
  btnQuitar.className='btn-quitar-enlace';
  btnQuitar.textContent='✕';
  btnQuitar.onclick=()=>row.remove();
  row.appendChild(inputNombre);
  row.appendChild(inputUrl);
  row.appendChild(btnQuitar);
  container.appendChild(row);
}
btnAgregarEnlace.onclick=()=>agregarFilaEnlace(enlacesContainer);
agregarFilaEnlace(enlacesContainer);
modalBtnAgregarEnlace.onclick=()=>agregarFilaEnlace(modalEnlacesContainer);

btnAdmin.onclick=()=>{appPage.classList.add('hidden');adminLoginPage.classList.remove('hidden')};btnCancelarAdmin.onclick=()=>{adminLoginPage.classList.add('hidden');appPage.classList.remove('hidden')};btnVolver.onclick=()=>{adminPage.classList.add('hidden');appPage.classList.remove('hidden');cargarTrabajos()};btnVerTareas.onclick=()=>document.querySelector('.works-section').scrollIntoView({behavior:'smooth'});btnMiPerfil.onclick=()=>document.querySelector('#perfilSection').scrollIntoView({behavior:'smooth'});
adminLoginForm.addEventListener('submit',e=>{e.preventDefault();if(adminUsuario.value.trim()===adminCorrecto&&adminPassword.value.trim()===passwordAdminCorrecto){adminLoginPage.classList.add('hidden');adminPage.classList.remove('hidden');adminUsuario.value='';adminPassword.value='';renderizarPanelAdmin()}else alert('Usuario o contraseña de admin incorrectos.')});

trabajoForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const btn=trabajoForm.querySelector('button[type="submit"]');
  const textoOriginal=btn.textContent;
  btn.disabled=true;btn.textContent='Guardando...';

  const adjuntos=[];

  const inputArchivos=$('archivos');
  for(const file of inputArchivos.files){
    const nombreLimpio=file.name.replace(/[^a-zA-Z0-9.\-_]/g,'_');
    const ruta=`${Date.now()}_${nombreLimpio}`;
    const {error:errorSubida}=await sb.storage.from('trabajos').upload(ruta,file);
    if(errorSubida){
      alert('Error al subir "'+file.name+'": '+errorSubida.message);
      btn.disabled=false;btn.textContent=textoOriginal;
      return;
    }
    const {data:urlData}=sb.storage.from('trabajos').getPublicUrl(ruta);
    adjuntos.push({tipo:'archivo',nombre:file.name,url:urlData.publicUrl});
  }

  document.querySelectorAll('#enlacesContainer .enlace-row').forEach(row=>{
    const url=row.querySelector('.enlace-url').value.trim();
    if(!url)return;
    const nombre=row.querySelector('.enlace-nombre').value.trim()||url;
    adjuntos.push({tipo:'enlace',nombre,url});
  });

  const {data:insertado,error}=await sb.from('trabajos').insert({
    titulo:$('titulo').value,
    curso:$('curso').value,
    unidad:Number($('unidad').value),
    semana:Number($('semana').value),
    descripcion:$('descripcion').value||'Sin descripción.',
    autor:$('autor').value||'Estudiante',
    adjuntos
  }).select();

  btn.disabled=false;btn.textContent=textoOriginal;

  if(error){alert('Error al guardar el trabajo: '+error.message);return;}

  if(insertado&&insertado.length){
    trabajos.unshift(insertado[0]);
    renderizarTodo();
  }

  trabajoForm.reset();
  $('autor').value='JOSE LUIS ESPINAL HUAMAN';
  enlacesContainer.innerHTML='';
  agregarFilaEnlace(enlacesContainer);
  alert('Trabajo guardado correctamente. Ya es visible para todos.');
});

adminForm.addEventListener('submit',e=>{e.preventDefault();let u=Number(adminUnidad.value),s=Number(adminSemana.value);textosSemanas[clave(u,s)]=adminTexto.value.trim();guardarTextos();renderizarPanelAdmin();renderizarUnidades();alert('Texto guardado correctamente.')});

function filtrados(){let tx=buscar.value.toLowerCase(),u=filtroUnidad.value,s=filtroSemana.value;return trabajos.filter(t=>`${t.titulo} ${t.curso} ${t.descripcion} ${t.autor}`.toLowerCase().includes(tx)&&(u==='Todas'||Number(t.unidad)===Number(u))&&(s==='Todas'||Number(t.semana)===Number(s)))}

function renderizarTrabajos(){
  let arr=filtrados();
  trabajosContainer.innerHTML='';
  if(!arr.length){emptyMessage.classList.remove('hidden');return}
  emptyMessage.classList.add('hidden');
  arr.forEach(t=>{
    let sg=semanaGlobal(t.unidad,t.semana),txt=textoSemana(t.unidad,t.semana);
    let fechaCorta=t.fecha?String(t.fecha).slice(0,10):'';
    let nAdj=(t.adjuntos||[]).length;
    let etiquetaAdj=nAdj===0?'Sin archivos ni enlaces':`${nAdj} adjunto${nAdj===1?'':'s'}`;
    let card=document.createElement('article');
    card.className='work-card';
    card.innerHTML=`<div class="work-top"><div class="file-icon">📄</div></div><h3>${t.titulo}</h3><p>📘 ${t.curso}</p><p>📚 Unidad ${t.unidad} - Semana ${sg}</p><p>👤 ${t.autor}</p><p>🗓️ ${fechaCorta}</p>${txt?`<p class="week-content-card">📝 ${txt}</p>`:''}<p class="description">${t.descripcion}</p><div class="file-name">🏷️ ${etiquetaAdj}</div><div class="work-actions"><button class="btn-light" onclick="verAdjuntos(${t.id})">Ver</button><button class="btn-danger" onclick="eliminarTrabajo(${t.id})">Eliminar</button></div>`;
    trabajosContainer.appendChild(card)
  })
}

function verAdjuntos(id){
  const t=trabajos.find(x=>x.id===id);
  if(!t)return;
  trabajoActualId=id;
  const sg=semanaGlobal(t.unidad,t.semana);
  modalTitulo.textContent=t.titulo;
  modalSubtitulo.textContent=`${t.curso} · Unidad ${t.unidad} - Semana ${sg}`;
  modalLista.innerHTML='';
  const adjuntos=t.adjuntos||[];
  if(!adjuntos.length){
    const vacio=document.createElement('p');
    vacio.style.color='#9aa4c7';
    vacio.textContent='Este trabajo no tiene archivos ni enlaces adjuntos.';
    modalLista.appendChild(vacio);
  }else{
    adjuntos.forEach(a=>{
      const row=document.createElement('div');
      row.className='modal-item';
      const icono=a.tipo==='enlace'?'🔗':'📎';
      const span=document.createElement('span');
      span.textContent=`${icono} ${a.nombre}`;
      span.title=a.nombre;
      const btn=document.createElement('button');
      btn.textContent='Ver';
      btn.onclick=()=>window.open(a.url,'_blank');
      row.appendChild(span);
      row.appendChild(btn);
      modalLista.appendChild(row);
    });
  }
  modalEnlacesContainer.innerHTML='';
  agregarFilaEnlace(modalEnlacesContainer);
  modalArchivos.value='';
  modalAdjuntos.classList.remove('hidden');
}

modalBtnGuardarMas.onclick=async()=>{
  if(trabajoActualId==null)return;
  const t=trabajos.find(x=>x.id===trabajoActualId);
  if(!t)return;

  const btn=modalBtnGuardarMas;
  const textoOriginal=btn.textContent;
  btn.disabled=true;btn.textContent='Agregando...';

  const nuevosAdjuntos=[];

  for(const file of modalArchivos.files){
    const nombreLimpio=file.name.replace(/[^a-zA-Z0-9.\-_]/g,'_');
    const ruta=`${Date.now()}_${nombreLimpio}`;
    const {error:errorSubida}=await sb.storage.from('trabajos').upload(ruta,file);
    if(errorSubida){
      alert('Error al subir "'+file.name+'": '+errorSubida.message);
      btn.disabled=false;btn.textContent=textoOriginal;
      return;
    }
    const {data:urlData}=sb.storage.from('trabajos').getPublicUrl(ruta);
    nuevosAdjuntos.push({tipo:'archivo',nombre:file.name,url:urlData.publicUrl});
  }

  modalEnlacesContainer.querySelectorAll('.enlace-row').forEach(row=>{
    const url=row.querySelector('.enlace-url').value.trim();
    if(!url)return;
    const nombre=row.querySelector('.enlace-nombre').value.trim()||url;
    nuevosAdjuntos.push({tipo:'enlace',nombre,url});
  });

  if(!nuevosAdjuntos.length){
    alert('Agrega al menos un archivo o un enlace.');
    btn.disabled=false;btn.textContent=textoOriginal;
    return;
  }

  const adjuntosActualizados=[...(t.adjuntos||[]),...nuevosAdjuntos];
  const {error}=await sb.from('trabajos').update({adjuntos:adjuntosActualizados}).eq('id',trabajoActualId);

  btn.disabled=false;btn.textContent=textoOriginal;

  if(error){alert('Error al agregar: '+error.message);return;}

  t.adjuntos=adjuntosActualizados;
  renderizarTrabajos();
  verAdjuntos(trabajoActualId);
  alert('Se agregó correctamente a este trabajo.');
};

btnCerrarModal.onclick=()=>{modalAdjuntos.classList.add('hidden');trabajoActualId=null};
modalAdjuntos.addEventListener('click',e=>{if(e.target===modalAdjuntos){modalAdjuntos.classList.add('hidden');trabajoActualId=null}});

function renderizarUnidades(){unidadesContainer.innerHTML='';for(let u=1;u<=4;u++){let total=trabajos.filter(t=>Number(t.unidad)===u).length,html='';for(let s=1;s<=4;s++){let sg=semanaGlobal(u,s),cant=trabajos.filter(t=>Number(t.unidad)===u&&Number(t.semana)===s).length,txt=textoSemana(u,s),res=txt?txt.substring(0,45)+(txt.length>45?'...':''):'Sin texto';html+=`<button class="week-btn" onclick="filtrarPorSemana(${u},${s})"><span class="week-title">Semana ${sg}</span><strong>${cant}</strong><small>${res}</small></button>`}let div=document.createElement('div');div.className='unit-card';div.innerHTML=`<div class="unit-head"><h3>Unidad ${u}</h3><span>${total} trabajos</span></div><div class="weeks-grid">${html}</div>`;unidadesContainer.appendChild(div)}}

function renderizarPanelAdmin(){adminContenidoLista.innerHTML='';for(let u=1;u<=4;u++){let html='';for(let s=1;s<=4;s++){html+=`<div class="admin-week-item"><div><strong>Unidad ${u} - Semana ${semanaGlobal(u,s)}</strong><p>${textoSemana(u,s)||'Sin texto agregado todavía.'}</p></div><button class="btn-secondary btn-small" onclick="editarTextoSemana(${u},${s})">Editar</button></div>`}let div=document.createElement('div');div.className='admin-unit-block';div.innerHTML=`<h3>Unidad ${u}</h3>${html}`;adminContenidoLista.appendChild(div)}}

function editarTextoSemana(u,s){adminUnidad.value=String(u);adminSemana.value=String(s);adminTexto.value=textoSemana(u,s);adminTexto.focus()}

function renderizarTodo(){if(totalTrabajos)totalTrabajos.textContent=trabajos.length;renderizarUnidades();renderizarTrabajos()}

async function eliminarTrabajo(id){
  if(!confirm('¿Seguro que quieres eliminar este trabajo? Esta acción no se puede deshacer.'))return;
  const {error}=await sb.from('trabajos').delete().eq('id',id);
  if(error){alert('Error al eliminar: '+error.message);return;}
  trabajos=trabajos.filter(t=>t.id!==id);
  renderizarTodo();
}

function filtrarPorSemana(u,s){filtroUnidad.value=String(u);filtroSemana.value=String(s);renderizarTrabajos();document.querySelector('.works-section').scrollIntoView({behavior:'smooth'})}

buscar.oninput=renderizarTrabajos;filtroUnidad.onchange=renderizarTrabajos;filtroSemana.onchange=renderizarTrabajos;limpiarFiltros.onclick=()=>{buscar.value='';filtroUnidad.value='Todas';filtroSemana.value='Todas';renderizarTrabajos()};

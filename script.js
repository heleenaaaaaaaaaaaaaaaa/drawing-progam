const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('color');
const sizeInput = document.getElementById('size');
const eraserBtn = document.getElementById('eraser');
const undoBtn = document.getElementById('undo');
const clearBtn = document.getElementById('clear');
const downloadBtn = document.getElementById('download');
const modeSelect = document.getElementById('mode');
const fillCheckbox = document.getElementById('fill');

let isDrawing = false;
let lastX = 0, lastY = 0;
let erasing = false;
let startX = 0, startY = 0;
let savedImageData = null;

ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// Undo stack stores dataURLs
const undoStack = [];
const MAX_UNDO = 50;

function pushState(){
  try{
    if(undoStack.length >= MAX_UNDO) undoStack.shift();
    undoStack.push(canvas.toDataURL());
    updateUndoButton();
  }catch(e){console.warn('Cannot push state', e)}
}

function restoreState(dataURL){
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,0,0);
  };
  img.src = dataURL;
}

function updateUndoButton(){
  undoBtn.disabled = undoStack.length <= 1;
}

// Initialize with empty state
pushState();

function getPos(e){
  const rect = canvas.getBoundingClientRect();
  if(e.touches && e.touches[0]){
    return {x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top};
  }
  return {x: e.clientX - rect.left, y: e.clientY - rect.top};
}

function startDraw(e){
  isDrawing = true;
  const p = getPos(e);
  lastX = p.x; lastY = p.y;
  const mode = modeSelect.value;
  if(mode === 'brush'){
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
  } else {
    // for shapes save start point and snapshot for preview
    startX = p.x; startY = p.y;
    try{
      savedImageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    }catch(e){ savedImageData = null; }
  }
  e.preventDefault();
}

function draw(e){
  if(!isDrawing) return;
  const p = getPos(e);
  const mode = modeSelect.value;

  if(mode === 'brush'){
    ctx.strokeStyle = erasing ? 'rgba(0,0,0,1)' : colorInput.value;
    ctx.lineWidth = sizeInput.value;
    if(erasing){
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x; lastY = p.y;
  } else {
    // preview: restore snapshot then draw shape
    if(savedImageData) ctx.putImageData(savedImageData,0,0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = sizeInput.value;
    ctx.strokeStyle = colorInput.value;
    ctx.fillStyle = colorInput.value;

    if(mode === 'line'){
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else if(mode === 'rect'){
      const x = Math.min(startX, p.x);
      const y = Math.min(startY, p.y);
      const w = Math.abs(p.x - startX);
      const h = Math.abs(p.y - startY);
      if(fillCheckbox.checked) ctx.fillRect(x, y, w, h);
      else ctx.strokeRect(x, y, w, h);
    } else if(mode === 'circle'){
      const dx = p.x - startX;
      const dy = p.y - startY;
      const r = Math.sqrt(dx*dx + dy*dy);
      ctx.beginPath();
      ctx.arc(startX, startY, r, 0, Math.PI*2);
      if(fillCheckbox.checked) ctx.fill();
      else ctx.stroke();
    }
  }
  e.preventDefault();
}

function endDraw(e){
  if(!isDrawing) return;
  const mode = modeSelect.value;
  isDrawing = false;
  if(mode === 'brush'){
    ctx.closePath();
    pushState();
  } else {
    // final preview already drawn on canvas; just push state
    pushState();
    savedImageData = null;
  }
  e.preventDefault();
}

// Mouse events
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
window.addEventListener('mouseup', endDraw);

// Touch events
canvas.addEventListener('touchstart', startDraw, {passive:false});
canvas.addEventListener('touchmove', draw, {passive:false});
window.addEventListener('touchend', endDraw);

// Buttons
eraserBtn.addEventListener('click', ()=>{
  erasing = !erasing;
  eraserBtn.classList.toggle('active', erasing);
});

clearBtn.addEventListener('click', ()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
  pushState();
});

undoBtn.addEventListener('click', ()=>{
  if(undoStack.length <= 1) return;
  // remove current state
  undoStack.pop();
  const prev = undoStack[undoStack.length-1];
  restoreState(prev);
  updateUndoButton();
});

downloadBtn.addEventListener('click', ()=>{
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Resize canvas responsively while preserving content (optional)
function resizeCanvas(width, height){
  const tmp = document.createElement('canvas');
  tmp.width = canvas.width; tmp.height = canvas.height;
  const tmpCtx = tmp.getContext('2d');
  tmpCtx.drawImage(canvas,0,0);
  canvas.width = width; canvas.height = height;
  ctx.drawImage(tmp,0,0);
}

// Prevent drawing outside canvas when mouse leaves and returns
canvas.addEventListener('mouseleave', (e)=>{ if(isDrawing) endDraw(e); });

// Keyboard shortcut for undo (Ctrl+Z)
window.addEventListener('keydown', (e)=>{
  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='z'){
    undoBtn.click();
    e.preventDefault();
  }
});

// Keep undo button state
updateUndoButton();

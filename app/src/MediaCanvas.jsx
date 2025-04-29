import React, { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Rnd } from 'react-rnd';
import { Trash } from 'lucide-react';
import AudioItem from './AudioItem';
import toolbarIcon from './assets/toolbarIcon.png';

const CONTROL_BAR       = 40;
const INITIAL_SIZE      = { width: 220, height: 160 };
const CORNERS           = ['topLeft','topRight','bottomLeft','bottomRight'];
const CLICK_SUPPRESS_MS = 200;
const AUTHORS           = ['ALICE','BOB','CAROL','DAVE','EVE'];

const TRASH_W = window.innerWidth  * 0.10;   // 10 vw
const TRASH_H = window.innerHeight * 0.10;   // 10 vh

function useDragClickGuard() {
  const moved = useRef(false);
  return {
    onStart()     { moved.current = false; },
    onMove()      { moved.current = true;  },
    isPureClick() { return !moved.current; },
  };
}

function MediaItem({ item, onUpdate, onDelete, showTrash, setShowTrash }) {
  const videoRef                         = useRef(null);
  const [lockRatio, setLockRatio]        = useState(false);
  const [overDrag,  setOverDrag]         = useState(false);
  const [showCtrl, setShowCtrl]          = useState(false);
  const [showToolbarAudio, setShowToolbarAudio] = useState(false);
  const { onStart, onMove, isPureClick } = useDragClickGuard();

  // ── Author label ─────────────────────────────────────────
  const authorTag = (
    <div
      style={{
        position:'absolute', top:4, left:6,
        fontSize:'0.75rem', fontWeight:600,
        color:'#38FF11', letterSpacing:'0.05em',
        pointerEvents:'none', userSelect:'none', textTransform:'uppercase',
      }}
    >
      {item.author}
    </div>
  );

  // ── State updates ───────────────────────────────────────
  const drag = (_, d) => onUpdate(item.id, { x:d.x, y:d.y });
  const resize = (_, __, ref, ___, pos) =>
    onUpdate(item.id, {
      x:pos.x, y:pos.y, width:ref.offsetWidth, height:ref.offsetHeight,
    });

  // ── Deletion check on drag stop ─────────────────────────
  const maybeDelete = (_, d) => {
    setShowTrash(false);
    const cx = d.x + item.width  / 2;
    const cy = d.y + item.height / 2;
    if (cx < TRASH_W && cy < TRASH_H) onDelete(item.id);
  };

  // ── Video play/pause ────────────────────────────────────
  const togglePlay = e => {
    e.stopPropagation();
    if (!isPureClick()) return;
    const v = videoRef.current;
    v && (v.paused ? v.play() : v.pause());
  };

  // ── Render ──────────────────────────────────────────────
  return (
    <Rnd
      position={{ x:item.x, y:item.y }}
      size={{ width:item.width, height:item.height }}

      onDragStart={() => { onStart(); setShowTrash(true); }}
      onDrag      ={(e,d)=>{ onMove(); drag(e,d); }}
      onDragStop  ={maybeDelete}

      onResizeStart={(_,dir)=>{ onStart(); setLockRatio(CORNERS.includes(dir)); setShowTrash(true); }}
      onResize     ={(e,dir,ref,delta,pos)=>{ onMove(); resize(e,dir,ref,delta,pos); }}
      onResizeStop ={(e,dir,ref,delta,pos)=>{ resize(e,dir,ref,delta,pos); maybeDelete(e,{...pos}) }}

      lockAspectRatio     ={lockRatio}
      dragHandleClassName ={item.isVideo ? 'video-dragger' : undefined}
      enableResizing
      style={{ overflow:'visible' }}

      onMouseEnter={item.isAudio ? () => setShowToolbarAudio(true)  : undefined}
      onMouseLeave={item.isAudio ? () => setShowToolbarAudio(false) : undefined}
    >
      {item.isVideo ? (
        <div
          className="relative w-full h-full select-none"
          onMouseEnter={() => setShowCtrl(true)}
          onMouseLeave={() => setShowCtrl(false)}
        >
          {authorTag}
          <div
            className="video-dragger absolute inset-0"
            style={{ height:`calc(100% - ${CONTROL_BAR}px)`, cursor:'move' }}
            onMouseEnter={()=>setOverDrag(true)}
            onMouseLeave={()=>setOverDrag(false)}
          />
          {overDrag && (
            <img
              src={toolbarIcon}
              alt=""
              style={{
                position:'absolute', bottom:(CONTROL_BAR-40)/2, left:'50%',
                width:40,height:40, transform:'translateX(-50%)',
                pointerEvents:'none',
              }}
            />
          )}
          <video
            ref={videoRef}
            src={item.src}
            controls={showCtrl}
            loop muted
            style={{ width:'100%',height:'100%',objectFit:'fill',borderRadius:'0.375rem' }}
            onClick={togglePlay}
          />
        </div>
      ) : item.isAudio ? (
        <AudioItem
          item={item}
          authorTag={authorTag}
          onInteractionEnd={()=>{}}
          showToolbar={showToolbarAudio}
        />
      ) : (
        <div className="relative w-full h-full select-none">
          {authorTag}
          <img
            src={item.src}
            alt=""
            style={{ width:'100%',height:'100%',objectFit:'fill',borderRadius:'0.375rem',pointerEvents:'none' }}
          />
        </div>
      )}
    </Rnd>
  );
}

/* ─────────────────────────── Canvas ───────────────────────────── */
export default function MediaCanvas() {
  const [items, setItems]   = useState([]);
  const [showTrash, setShowTrash] = useState(false);
  const lastInteraction     = useRef(0);

  const addFiles = useCallback(files => {
    setItems(prev => [
      ...prev,
      ...files.map((f,i)=>({
        id : `${Date.now()}-${i}`,
        src: URL.createObjectURL(f),
        isVideo: f.type.startsWith('video'),
        isAudio: f.type.startsWith('audio'),
        author : AUTHORS[(prev.length+i)%AUTHORS.length],
        x:60+prev.length*20, y:60+prev.length*20, ...INITIAL_SIZE,
      })),
    ]);
  }, []);

  const updateItem = (id, patch) =>
    setItems(prev => prev.map(it => it.id===id ? { ...it, ...patch } : it));

  const deleteItem = id =>
    setItems(prev => prev.filter(it => it.id !== id));

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop:addFiles,
    accept:{'image/*':[],'video/*':[],'audio/*':[]},
    noClick:true,noKeyboard:true,
  });

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Trash overlay */}
      {showTrash && (
        <div
          style={{
            position:'fixed', top:0, left:0,
            width:TRASH_W, height:TRASH_H,
            background:'rgba(255,0,0,0.15)',
            border:'2px dashed red',
            display:'flex', alignItems:'center', justifyContent:'center',
            zIndex:9999, pointerEvents:'none',
          }}
        >
          <Trash size={32} color="red" />
        </div>
      )}

      <div
        {...getRootProps()}
        onClick={e=>{
          if(e.target!==e.currentTarget) return;
          if(Date.now()-lastInteraction.current<CLICK_SUPPRESS_MS) return;
          open();
        }}
        className={`relative flex-1 border-2 border-dashed rounded-lg p-2 ${
          isDragActive?'border-blue-500':'border-gray-300'}`}
      >
        <input {...getInputProps()} />

        {items.length===0 && (
          <p className="placeholder">Drop files or click to upload</p>
        )}

        {items.map(item=>(
          <MediaItem
            key={item.id}
            item={item}
            onUpdate={updateItem}
            onDelete={deleteItem}
            showTrash={showTrash}
            setShowTrash={setShowTrash}
          />
        ))}
      </div>
    </div>
  );
}

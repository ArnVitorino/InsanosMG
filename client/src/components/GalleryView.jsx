import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Trash2, Image as ImageIcon, X, ChevronLeft, ChevronRight, Download, Plus, Check, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { api } from '../services/api';

// Utility function to compress images in browser before upload
async function compressImageFile(file, maxWidth = 1280, maxHeight = 1280, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with specified quality
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function GalleryView({
  events,
  selectedEventId,
  onSelectEvent,
  members,
  auth
}) {
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [activePhotoIndex, setActivePhotoIndex] = useState(null); // For fullscreen lightbox
  const [captionInput, setCaptionInput] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  // Saved member identity
  const savedMemberId = localStorage.getItem('insanos_saved_member_id') || '';
  const currentMember = members.find(m => m.id === parseInt(savedMemberId, 10));
  const defaultUploaderName = auth?.role === 'admin' 
    ? 'Diretoria (Admin)' 
    : (currentMember ? `${currentMember.name}${currentMember.nickname ? ` (${currentMember.nickname})` : ''}` : 'Irmão');

  const [uploaderName, setUploaderName] = useState(defaultUploaderName);

  // Fetch photos whenever selected event changes
  const fetchPhotos = async () => {
    if (!activeEvent?.id) return;
    setLoadingPhotos(true);
    try {
      const data = await api.getEventPhotos(activeEvent.id);
      setPhotos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar fotos:', err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [activeEvent?.id]);

  // Handle files selected from device
  const handleFilesChosen = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(files);

    // Generate quick low-res thumbnails for preview
    const previews = files.map(f => URL.createObjectURL(f));
    setFilePreviews(previews);
    setShowUploadModal(true);
  };

  // Perform compression and upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || !activeEvent) return;

    setUploading(true);
    setUploadProgress(`Preparando 0 de ${selectedFiles.length}...`);

    try {
      const compressedList = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadProgress(`Otimizando foto ${i + 1} de ${selectedFiles.length}...`);
        const dataUrl = await compressImageFile(selectedFiles[i]);
        compressedList.push({
          dataUrl,
          caption: captionInput.trim(),
          uploaderName: uploaderName.trim() || 'Irmão'
        });
      }

      setUploadProgress(`Gravando no álbum...`);
      await api.addEventPhotos(activeEvent.id, compressedList);

      // Cleanup
      setSelectedFiles([]);
      filePreviews.forEach(p => URL.revokeObjectURL(p));
      setFilePreviews([]);
      setCaptionInput('');
      setShowUploadModal(false);
      fetchPhotos();
    } catch (err) {
      alert('Erro ao enviar fotos. Verifique os arquivos.');
      console.error(err);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  // Delete photo
  const handleDeletePhoto = async (photoId, e) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja remover esta foto do álbum?')) return;

    try {
      await api.deleteEventPhoto(activeEvent.id, photoId);
      if (activePhotoIndex !== null) setActivePhotoIndex(null);
      fetchPhotos();
    } catch (err) {
      alert('Erro ao excluir foto.');
    }
  };

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activePhotoIndex === null) return;
      if (e.key === 'Escape') setActivePhotoIndex(null);
      if (e.key === 'ArrowLeft') {
        setActivePhotoIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
      }
      if (e.key === 'ArrowRight') {
        setActivePhotoIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, photos.length]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-[#14151a] border border-amber-950/80 rounded-2xl p-5 md:p-6 shadow-2xl biker-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/60 flex items-center justify-center text-amber-400">
                <Camera className="w-4 h-4" />
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
                Álbum de Fotos dos Eventos
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Espaço oficial para irmãos e diretoria compartilharem registros e momentos dos encontros
            </p>
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-amber-950 hover:scale-[1.02]"
            >
              <Upload className="w-4 h-4" />
              <span>Anexar Fotos</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChosen}
              className="hidden"
            />
          </div>
        </div>

        {/* Event Picker Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-mono uppercase text-amber-400 font-bold whitespace-nowrap">
              Evento:
            </span>
            <select
              value={activeEvent?.id || ''}
              onChange={(e) => onSelectEvent(parseInt(e.target.value, 10))}
              className="w-full sm:max-w-md px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-amber-500 font-sans"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.dateFormatted || ev.date})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
            <span>📅 {activeEvent?.dateFormatted || activeEvent?.date}</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{photos.length} {photos.length === 1 ? 'foto' : 'fotos'}</span>
          </div>
        </div>
      </div>

      {/* Photos Grid Area */}
      {loadingPhotos ? (
        <div className="p-16 text-center bg-[#131418] border border-neutral-800 rounded-2xl">
          <span className="text-3xl animate-bounce block mb-2">📸</span>
          <p className="text-xs font-mono text-amber-400 uppercase tracking-widest">
            Carregando fotos do evento...
          </p>
        </div>
      ) : photos.length === 0 ? (
        <div className="p-12 md:p-16 text-center bg-[#131418] border border-neutral-800 rounded-2xl space-y-4 biker-border">
          <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-600">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase">
              Nenhuma foto anexada para este evento ainda
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
              Seja o primeiro a compartilhar fotos do bonde, dos irmãos ou do evento!
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-amber-950"
          >
            <Plus className="w-4 h-4" />
            Adicionar a Primeira Foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => setActivePhotoIndex(index)}
              className="group relative rounded-xl overflow-hidden border border-amber-950/70 hover:border-amber-500/80 bg-[#121318] shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer biker-border flex flex-col"
            >
              {/* Photo Image Aspect */}
              <div className="aspect-square w-full overflow-hidden bg-black/60 relative">
                <img
                  src={photo.dataUrl}
                  alt={photo.caption || 'Foto do evento'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5" />
              </div>

              {/* Caption & Uploader footer */}
              <div className="p-2.5 bg-[#14161d] border-t border-neutral-800/80 flex items-center justify-between gap-1 text-[11px] font-mono">
                <div className="truncate flex-1">
                  {photo.caption ? (
                    <p className="text-neutral-200 font-semibold truncate" title={photo.caption}>
                      {photo.caption}
                    </p>
                  ) : null}
                  <span className="text-neutral-400 text-[10px] block truncate">
                    Por: <strong className="text-amber-400">{photo.uploaderName || 'Irmão'}</strong>
                  </span>
                </div>

                {/* Delete button (Diretoria or member) */}
                {auth?.role === 'admin' && (
                  <button
                    onClick={(e) => handleDeletePhoto(photo.id, e)}
                    title="Excluir foto"
                    className="p-1 rounded-lg hover:bg-red-950/80 text-neutral-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Confirmation Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#16171d] border border-amber-600/70 rounded-2xl shadow-2xl p-5 md:p-6 space-y-4 biker-border">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                Anexar {selectedFiles.length} {selectedFiles.length === 1 ? 'Foto' : 'Fotos'} ao Evento
              </h3>
              <button
                onClick={() => {
                  if (!uploading) {
                    setShowUploadModal(false);
                    setSelectedFiles([]);
                  }
                }}
                disabled={uploading}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Previews Grid */}
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-black/50 rounded-xl border border-neutral-800">
              {filePreviews.map((src, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900">
                  <img src={src} alt="Prévia" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">
                  Legenda / Observação (Opcional):
                </label>
                <input
                  type="text"
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  placeholder="Ex: Comboio na rodovia, almoço com os irmãos..."
                  disabled={uploading}
                  className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase mb-1">
                  Nome de quem está postando:
                </label>
                <input
                  type="text"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  placeholder="Seu nome / apelido"
                  disabled={uploading}
                  className="w-full px-3 py-2 bg-[#0c0d10] border border-neutral-700 rounded-lg text-white text-xs font-bold"
                />
              </div>

              {uploading && (
                <div className="p-3 bg-amber-950/60 border border-amber-600/70 rounded-xl text-xs text-amber-300 font-mono flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                  <span>{uploadProgress || 'Processando fotos...'}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles([]);
                  }}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold uppercase transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950"
                >
                  {uploading ? (
                    <span>Enviando...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Salvar Fotos no Álbum
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {activePhotoIndex !== null && photos[activePhotoIndex] && (
        <div 
          onClick={() => setActivePhotoIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4 select-none animate-fadeIn"
        >
          {/* Close button */}
          <button
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/80 hover:bg-neutral-800 text-white border border-neutral-700 transition"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Arrow */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-full bg-black/80 hover:bg-neutral-800 text-white border border-neutral-700 transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Right Arrow */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-50 p-2.5 rounded-full bg-black/80 hover:bg-neutral-800 text-white border border-neutral-700 transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Central Image Container */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[90vh] flex flex-col items-center justify-center space-y-3"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/80 shadow-2xl bg-black">
              <img
                src={photos[activePhotoIndex].dataUrl}
                alt={photos[activePhotoIndex].caption || 'Foto'}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Lightbox Footer Info */}
            <div className="w-full bg-[#14161e]/90 border border-amber-500/40 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div>
                {photos[activePhotoIndex].caption && (
                  <p className="text-white font-bold text-sm">
                    {photos[activePhotoIndex].caption}
                  </p>
                )}
                <span className="text-neutral-400">
                  Enviada por <strong className="text-amber-400">{photos[activePhotoIndex].uploaderName || 'Irmão'}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-neutral-400">
                  {activePhotoIndex + 1} de {photos.length}
                </span>
                <a
                  href={photos[activePhotoIndex].dataUrl}
                  download={`insanos-foto-${activePhotoIndex + 1}.jpg`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

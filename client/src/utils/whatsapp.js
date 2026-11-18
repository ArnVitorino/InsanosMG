export const RENDER_APP_URL = "https://insanosmg.onrender.com";

/**
 * Gera o texto oficial de convocação para o WhatsApp
 */
export function generateEventInviteText(event, config = {}) {
  const club = config.clubName || "INSANOS M.C.";
  const division = config.division || "DIVISÃO MOGI GUAÇU";
  const motto = config.motto || "SOMOS DE VERDADE";
  const dateStr = event.dateFormatted || event.date;

  let text = `☠️ *${club} – ${division}* ☠️\n`;
  text += `*"${motto}"*\n\n`;
  text += `📢 *CONVOCAÇÃO OFICIAL DE EVENTO*\n\n`;
  text += `📌 *Evento:* ${event.title}\n`;
  if (dateStr) text += `📅 *Data:* ${dateStr}\n`;
  if (event.time) text += `⏰ *Horário:* ${event.time}\n`;
  if (event.location) text += `📍 *Local:* ${event.location}\n`;
  if (event.category) text += `🏷️ *Tipo:* ${event.category}\n`;
  if (event.description) text += `📝 *Detalhes:* ${event.description}\n`;

  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `⚡ *ATENÇÃO IRMÃOS:*\n`;
  text += `Favor confirmarem presença ou ausência (com justificativa) pelo aplicativo ou pelo link:\n\n`;
  text += `👉 *Confirmar Presença no Link:*\n${RENDER_APP_URL}\n\n`;
  text += `_(Ou abra diretamente pelo aplicativo no seu celular)_\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `☠️ *${club} • ${division}* ☠️`;

  return text;
}

/**
 * Abre o WhatsApp diretamente com o texto pré-preenchido
 */
export function openWhatsAppWithText(text) {
  const encoded = encodeURIComponent(text);
  const url = `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
}

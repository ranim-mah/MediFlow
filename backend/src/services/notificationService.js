const { Expo } = require('expo-server-sdk');
const { User, Notification, Appointment } = require('../models');

const expo = new Expo();

async function removeInvalidTokens(userId, tokensToRemove) {
  const unique = [...new Set((tokensToRemove || []).filter(Boolean))];
  if (unique.length === 0) return 0;

  await User.updateOne(
    { _id: userId },
    {
      $pull: {
        pushTokens: { token: { $in: unique } },
      },
    }
  );

  return unique.length;
}

function normalizeTokens(pushTokens) {
  return (pushTokens || [])
    .map((entry) => entry?.token)
    .filter((token) => token && Expo.isExpoPushToken(token));
}

async function sendExpoPushToUser(userId, { title, body, data = {} }) {
  const user = await User.findById(userId).select('pushTokens');
  if (!user) return { sent: 0, skipped: true, reason: 'user_not_found' };

  const tokens = normalizeTokens(user.pushTokens);
  if (tokens.length === 0) {
    return { sent: 0, skipped: true, reason: 'no_tokens' };
  }

  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
  }));

  const chunks = expo.chunkPushNotifications(messages);
  let sent = 0;
  const receiptIdToToken = new Map();
  const invalidTokens = new Set();

  for (const chunk of chunks) {
    // Expo SDK handles chunking and returns tickets for accepted messages.
    // We also map receipt IDs back to the token to clean stale tokens.
    const tickets = await expo.sendPushNotificationsAsync(chunk);

    tickets.forEach((ticket, index) => {
      if (ticket.status === 'ok') {
        sent += 1;
        if (ticket.id) {
          receiptIdToToken.set(ticket.id, chunk[index]?.to);
        }
        return;
      }

      if (ticket?.details?.error === 'DeviceNotRegistered') {
        invalidTokens.add(chunk[index]?.to);
      }
    });
  }

  const receiptIds = [...receiptIdToToken.keys()];
  const receiptChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  for (const receiptChunk of receiptChunks) {
    const receipts = await expo.getPushNotificationReceiptsAsync(receiptChunk);
    Object.keys(receipts).forEach((id) => {
      const receipt = receipts[id];
      if (receipt?.status === 'error' && receipt?.details?.error === 'DeviceNotRegistered') {
        invalidTokens.add(receiptIdToToken.get(id));
      }
    });
  }

  const cleaned = await removeInvalidTokens(userId, [...invalidTokens]);

  return {
    sent,
    skipped: false,
    cleanedTokens: cleaned,
  };
}

async function createNotificationAndPush({
  userId,
  type,
  title,
  body,
  link,
  linkParams,
  relatedId,
  relatedType,
  priority = 'normal',
  channels = ['in_app', 'push'],
}) {
  const notification = await Notification.create({
    userId,
    type,
    title,
    body,
    link,
    linkParams,
    relatedId,
    relatedType,
    channels,
    priority,
  });

  let pushResult = { sent: 0, skipped: true, reason: 'channel_disabled' };
  if (channels.includes('push')) {
    pushResult = await sendExpoPushToUser(userId, {
      title,
      body,
      data: {
        type,
        notificationId: notification._id.toString(),
        relatedId: relatedId ? relatedId.toString() : null,
        relatedType: relatedType || null,
        link: link || null,
      },
    });
  }

  return { notification, pushResult };
}

async function notifyAppointmentPatient(appointmentId, payload) {
  const appointment = await Appointment.findById(appointmentId).populate('patientId', 'userId fullName patientCode');
  if (!appointment || !appointment.patientId?.userId) {
    return { notification: null, pushResult: { sent: 0, skipped: true, reason: 'patient_user_missing' } };
  }

  return createNotificationAndPush({
    userId: appointment.patientId.userId,
    relatedId: appointment._id,
    relatedType: 'Appointment',
    link: payload.link || '/patient/appointments',
    linkParams: payload.linkParams,
    ...payload,
  });
}

module.exports = {
  sendExpoPushToUser,
  createNotificationAndPush,
  notifyAppointmentPatient,
};
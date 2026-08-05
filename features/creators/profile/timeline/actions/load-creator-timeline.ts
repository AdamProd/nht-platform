"use server";

import { getTranslations } from "next-intl/server";
import { getCreatorTimeline } from "@/features/creators/profile/timeline/queries/get-creator-timeline";
import {
  CREATOR_TIMELINE_PAGE_SIZE,
  type CreatorTimelinePage,
} from "@/features/creators/profile/timeline/types/timeline";

async function loadTimelineCopy() {
  const t = await getTranslations("admin.creators.profileCrm.timeline");
  return {
    unknownActor: t("unknownActor"),
    copy: {
      creatorCreated: t("events.creatorCreated"),
      creatorCreatedDesc: t("events.creatorCreatedDesc"),
      creatorUpdated: t("events.creatorUpdated"),
      creatorUpdatedDesc: t("events.creatorUpdatedDesc"),
      avatarChangedDesc: t("events.avatarChangedDesc"),
      creatorArchived: t("events.creatorArchived"),
      creatorArchivedDesc: t("events.creatorArchivedDesc"),
      creatorRestored: t("events.creatorRestored"),
      creatorRestoredDesc: t("events.creatorRestoredDesc"),
      creatorDeleted: t("events.creatorDeleted"),
      creatorDeletedDesc: t("events.creatorDeletedDesc"),
      statusChanged: t("events.statusChanged"),
      statusChangedDesc: t("events.statusChangedDesc"),
      managerAssigned: t("events.managerAssigned"),
      managerAssignedDesc: t("events.managerAssignedDesc"),
      managerChanged: t("events.managerChanged"),
      managerChangedDesc: t("events.managerChangedDesc"),
      managerRemoved: t("events.managerRemoved"),
      managerRemovedDesc: t("events.managerRemovedDesc"),
      transactionCreated: t("events.transactionCreated"),
      transactionCreatedDesc: t("events.transactionCreatedDesc"),
      transactionUpdated: t("events.transactionUpdated"),
      transactionUpdatedDesc: t("events.transactionUpdatedDesc"),
      payoutCreated: t("events.payoutCreated"),
      payoutCreatedDesc: t("events.payoutCreatedDesc"),
      payoutUpdated: t("events.payoutUpdated"),
      payoutUpdatedDesc: t("events.payoutUpdatedDesc"),
      payoutApproved: t("events.payoutApproved"),
      payoutApprovedDesc: t("events.payoutApprovedDesc"),
      payoutRejected: t("events.payoutRejected"),
      payoutRejectedDesc: t("events.payoutRejectedDesc"),
      platformConnected: t("events.platformConnected"),
      platformConnectedDesc: t("events.platformConnectedDesc"),
      platformDisconnectedDesc: t("events.platformDisconnectedDesc"),
      onlyfansConnected: t("events.onlyfansConnected"),
      onlyfansDisconnected: t("events.onlyfansDisconnected"),
      fanslyConnected: t("events.fanslyConnected"),
      fanslyDisconnected: t("events.fanslyDisconnected"),
      manyvidsConnected: t("events.manyvidsConnected"),
      manyvidsDisconnected: t("events.manyvidsDisconnected"),
      documentUploaded: t("events.documentUploaded"),
      documentUploadedDesc: t("events.documentUploadedDesc"),
      documentDeleted: t("events.documentDeleted"),
      documentDeletedDesc: t("events.documentDeletedDesc"),
      ticketCreated: t("events.ticketCreated"),
      ticketCreatedDesc: t("events.ticketCreatedDesc"),
      ticketClosed: t("events.ticketClosed"),
      ticketClosedDesc: t("events.ticketClosedDesc"),
      notificationSent: t("events.notificationSent"),
      notificationSentDesc: t("events.notificationSentDesc"),
      invitationSent: t("events.invitationSent"),
      invitationSentDesc: t("events.invitationSentDesc"),
      taskCreated: t("events.taskCreated"),
      taskCreatedDesc: t("events.taskCreatedDesc"),
      taskUpdated: t("events.taskUpdated"),
      taskUpdatedDesc: t("events.taskUpdatedDesc"),
      taskAssigned: t("events.taskAssigned"),
      taskAssignedDesc: t("events.taskAssignedDesc"),
      taskCompleted: t("events.taskCompleted"),
      taskCompletedDesc: t("events.taskCompletedDesc"),
      taskDeleted: t("events.taskDeleted"),
      taskDeletedDesc: t("events.taskDeletedDesc"),
      genericEvent: t("events.genericEvent"),
      genericEventDesc: t("events.genericEventDesc"),
    },
  };
}

export async function loadCreatorTimelinePage(
  creatorId: string,
  page: number,
  limit = CREATOR_TIMELINE_PAGE_SIZE,
): Promise<CreatorTimelinePage> {
  const { copy, unknownActor } = await loadTimelineCopy();
  return getCreatorTimeline(creatorId, page, limit, copy, unknownActor);
}

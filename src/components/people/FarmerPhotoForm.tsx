"use client";

import { saveMyPhotoAction } from "@/actions/account";
import { setFarmerPhotoAction } from "@/actions/people";
import { PhotoUpload } from "@/components/provider/PhotoUpload";
import { ActionForm } from "@/components/ui/ActionForm";

/**
 * A farmer's profile picture. The farmer uses it on their Account Settings
 * (no userId); admins and coordinators use it on the farmer's page (userId).
 */
export function FarmerPhotoForm({
  userId,
  name,
  photoUrl,
}: {
  userId?: string;
  name: string;
  photoUrl: string | null;
}) {
  return (
    <ActionForm
      action={userId ? setFarmerPhotoAction : saveMyPhotoAction}
      submitLabel="Save Photo"
      pendingLabel="Saving…"
      resetOnSuccess={false}
      className="space-y-3"
    >
      {userId && <input type="hidden" name="userId" value={userId} />}
      <PhotoUpload
        initialUrl={photoUrl}
        name={name}
        label={userId ? "Profile photo" : null}
        hint="A clear photo of your face helps providers recognise you. On a phone you can take one with the camera."
      />
    </ActionForm>
  );
}

import ProfileService from "@rbxts/profileservice";
import { Players } from "@rbxts/services";
import { template } from "./Templates";
import { ProfileMetadata } from "Types/Data/ProfileMetadata";

const ProfileStore = ProfileService.GetProfileStore<ProfileData, ProfileMetadata>('Main', template);

export const LoadProfile = (player: Player) => {
	const profile = ProfileStore.LoadProfileAsync(tostring(player.UserId), () => 'Cancel');

	if (profile === undefined) {
		player.Kick("Profile not loaded! Please rejoin");
		return;
	}

	profile.AddUserId(player.UserId);
	profile.ListenToRelease(() => {
		player.Kick("Profile was realesed!");
	});

	if (player.IsDescendantOf(Players)) {
		profile.Reconcile();
		return profile;
	}
};

const Buttons = {
	OK: 'Ok',
	START_FACTORY: 'START FACTORY',
	APPLY_AS_CREATOR: 'APPLY AS CREATOR',
	SAVE_SETTINGS: 'SAVE SETTINGS',
	RESET_APP: 'Reset App',
};

const Headlines = {
	MESSAGES: 'Mitteilungen',
};

const Labels = {
	CAKES_PER_DAY: 'CAKES PER DAY: ',
	BAKER: 'BAKER: ',
	FEATURES_IN_USE: 'FEATURES IN USE: ',
	CAKES: 'CAKES',
	REWARD: 'REWARD',
	CODE_INPUT: 'Type in code',
	INSTAGRAM: 'Instagram',
	CREATOR_CODE: 'Creator code',
	DISPLAY_NAME: 'Display name',
	MESSAGE: 'Message',
	SOCIAL_MEDIA_PLATTFORMS: [ 'Instagram', 'Twitter', 'YouTube', 'Facebook', 'Twitch', 'TikTok' ],
};

const Subtexts = {
	TEST_OK: 'test ok',
	PASSWORD_RESET_REQUESTED: 'Reset your password by opening the link in the email',
	VERIFICATION_REQUESTED_CONTACT_IN_DAYS: 'We will contact you in the next few days',
	SUPPORTED_CREATOR: 'Which creator do you want to support?',
	APPLY_AS_CREATOR: 'Do you want to be one of our creators? Then apply now and benefit from your advantages!',
	APPLY_AS_CREATOR_INFO: 'After verification, your current account will be a creator account. To apply for a separate creator account, use cakehype.com/become-creator',
};

const Errors = {
	NO_CREATOR_CODE: 'Please type in a creator code first',
	CODE_IN_USE: 'Code in use',
	DISPLAY_NAME_IN_USE: 'Display name in use',
	EMAIL_NOT_VALID: 'This is not a valid email adress!',
	ENTER_CODE: 'Enter code',
	ENTER_EMAIL: 'Enter your email',
	ENTER_DISPLAY_NAME: 'Enter a display name',
	ENTER_SOCIAL_MEDIA: 'Enter a account',
	VERIFICATION_PENDING: "You currently can't request a creator account because your last request has not been processed yet.",
	GET_FACTORY_INFOS: 'While getting factory running infos from database with UID: ',
};

export { Buttons, Labels, Headlines, Subtexts, Errors };

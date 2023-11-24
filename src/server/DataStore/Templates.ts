export interface TemplateStatsValue {
	DisplayName: string;
	AbsoluteStatisticName?: keyof ProfileData['Statistics'];
	IsShowInLeaderstats: boolean;
}

export const template: ProfileData = {
	Statistics: {}
}

export const TemplateDynamicData: DynamicData = {
	
}


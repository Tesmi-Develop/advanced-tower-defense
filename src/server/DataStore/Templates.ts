export interface TemplateStatsValue {
	DisplayName: string;
	AbsoluteStatisticName?: keyof ProfileData['Statistics'];
	IsShowInLeaderstats: boolean;
}

export const template: ProfileData = {
	Statistics: {
		Money: 0
	}
}

export const TemplateDynamicData: DynamicData = {
	
}


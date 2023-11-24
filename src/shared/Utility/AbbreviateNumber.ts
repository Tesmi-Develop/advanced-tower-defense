import Abbreviator from "@rbxts/abbreviate";

const suffixTables = ["K","M","B","T","Qd","Qn","Sx","Sp","O","N","De","Ud","DD","TdD","QdD","QnD","SxD","SpD","OcD","NvD","Vgn","UVg","DVg","TVg","qtV","QnV","SeV","SPG","OVG","NVG","TGN","UTG","DTG","TsTG","QtTG","QnTG","SsTG","SpTG","OcTG","NoTG","QdDR","uQDR","dQDR","tQDR","qdQDR","QnQDR","sxQDR","SpQDR","OQDDr","NQDDr","qQGNT","uQGNT","dQGNT","tQGNT","qdQGNT","QnQGNT","sxQGNT","SpQGNT", "OQQGNT","NQQGNT","SXGNTL", "∞"]

const abbreviator = new Abbreviator();
abbreviator.setSetting('suffixTable', suffixTables);
abbreviator.setSetting('decimalPlaces', 2);
abbreviator.setSetting('stripTrailingZeroes', true);

export const AbbreviateNumber = (number: number) => {
    if (number === math.huge) {
        return '∞';
    }

    return abbreviator.numberToString(number, false);
}

export const AbbreviateString = (str: string) => {
    return abbreviator.stringToNumber(str);
}
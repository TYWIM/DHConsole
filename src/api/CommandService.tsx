// 删除重复的导入语句，只保留一个
import MuipService from './MuipService';

import { Character, Relic, MAIN_AFFIXES, SUB_AFFIXES } from './CharacterInfo';
import { Prop } from './PropInfo';

class CommandService {
  static readonly languageMap: Record<string, string> = {
    'zh_CN': 'CHS',
    'zh_HK': 'CHT',
    'en': 'EN',
    'ja': 'JP',
    'ko': 'KR',
    'es': 'ES',
    'fr': 'FR',
    'id': 'ID',
    'pt': 'PT',
    'ru': 'RU',
    'th': 'TH',
    'vi': 'VI',
  };
  static playerUid: number = 0;

  static setPlayerUid(playerUid: number) {
    this.playerUid = playerUid;
  }

  static async executeCommand(command: string): Promise<string> {
    try {
      console.log('Executing command:', command);
      const response = await MuipService.executeCommand(command, this.playerUid);
      if (response.code !== 0) {
        throw new Error(`Command failed: ${response.message}`);
      }
      return response.message;
    } catch (error) {
      console.error(`Error executing command: ${command}`, error);
      throw error;
    }
  }

  static async loadAvatarGameText(lang: string): Promise<Record<number, string>> {
    if (!this.languageMap[lang]) {
      throw new Error(`Invalid language code: ${lang}`);
    }
    const command = `gametext avatar #${this.languageMap[lang]}`;
    const result = await this.executeCommand(command);
    return this.parseGameText(result);
  }

  static async loadItemGameText(lang: string): Promise<Record<number, string>> {
    if (!this.languageMap[lang]) {
      throw new Error(`Invalid language code: ${lang}`);
    }
    const command = `gametext item #${this.languageMap[lang]}`;
    const result = await this.executeCommand(command);
    return this.parseGameText(result);
  }

  static async loadMainMissionGameText(lang: string): Promise<Record<number, string>> {
    if (!this.languageMap[lang]) {
      throw new Error(`Invalid language code: ${lang}`);
    }
    const command = `gametext mainmission #${this.languageMap[lang]}`;
    const result = await this.executeCommand(command);
    return this.parseGameText(result);
  }

  static async loadSubMissionGameText(lang: string): Promise<Record<number, string>> {
    if (!this.languageMap[lang]) {
      throw new Error(`Invalid language code: ${lang}`);
    }
    const command = `gametext submission #${this.languageMap[lang]}`;
    const result = await this.executeCommand(command);
    return this.parseGameText(result);
  }

  static async loadRelicTypes(): Promise<Record<number, number>> {
    const command = `gametext relic`;
    const result = await this.executeCommand(command);
    return this.parseItemList(result);
  }

  static async getInventory(): Promise<Record<number, number>> {
    const command = `fetch inventory`;
    const result = await this.executeCommand(command);
    return this.parseItemList(result);
  }

  static async giveItem(itemId: number, count = 1): Promise<{ itemId: number; count: number }> {
    const command = `give ${itemId} x${count}`;
    const result = await this.executeCommand(command);
    return { itemId, count: parseInt(result, 10) || count };
  }

  static async getOwnedCharacters(): Promise<number[]> {
    const command = `fetch owned`;
    const result = await this.executeCommand(command);
    return this.parseNumberList(result).filter((value, index, self) => self.indexOf(value) === index);
  }

  static async getCharacterInfo(characterId: number): Promise<Character> {
    const command = `fetch avatar ${characterId}`;
    const result = await this.executeCommand(command);
    return this.parseCharacterInfo(result);
  }

  static async setCharacterBasicInfo(characterId: number, level: number, rank: number, talent: number): Promise<void> {
    var command = `avatar level ${characterId} ${level}`;
    await this.executeCommand(command);
    command = `avatar rank ${characterId} ${rank}`;
    await this.executeCommand(command);
    command = `avatar talent ${characterId} ${talent}`;
    await this.executeCommand(command);
  }

  static async setCharacterEquip(characterId: number, equipId: number, equipLevel: number, equipRank: number): Promise<void> {
    const command = `equip item ${characterId} ${equipId} l${equipLevel} r${equipRank}`;
    await this.executeCommand(command);
  }

  static async setCharacterRelic(characterId: number, slotId: number, relic: Relic): Promise<void> {
    var mainAffixId = MAIN_AFFIXES[slotId].findIndex(affixes => affixes.includes(relic.mainAffix!));
    var subAffixIds = relic.subAffixes?.map(subAffix => SUB_AFFIXES.findIndex(affixes => affixes.includes(subAffix)));
    var subAffixStr = subAffixIds?.map((id, index) => `${id + 1}:${relic.subAffixLevels![index] - 1}`).join(' ');
    var relicStr = `${relic.relicId} l${relic.level} ${mainAffixId + 1} ${subAffixStr}`;
    const command = `equip relic ${characterId} ${relicStr}`;
    await this.executeCommand(command);
  }

  static async getCharacterRelicRecommend(characterId: number): Promise<Record<number, Relic>> {
    const command = `build recommend ${characterId}`;
    const result = await this.executeCommand(command);
    return this.parseRelicRecommend(result);
  }

  static async setCharacterRelics(characterId: number, relics: Record<number, Relic>): Promise<void> {
    for (const [slotId, relic] of Object.entries(relics)) {
      await this.setCharacterRelic(characterId, parseInt(slotId, 10), relic);
    }
  }

  static async getPlayerInfo(): Promise<{ level: number, gender: number }> {
    const command = `fetch player`;
    const result = await this.executeCommand(command);
    const match = result.match(/level: (\d+), gender: (\d+)/);
    if (!match || match.length < 3) {
      throw new Error('Failed to parse player info');
    }
    return { level: parseInt(match[1], 10), gender: parseInt(match[2], 10) };
  }

  static async setPlayerLevel(level: number): Promise<void> {
    const command = `setlevel ${level}`;
    await this.executeCommand(command);
  }

  static async setPlayerGender(gender: number): Promise<void> {
    if (gender !== 1 && gender !== 2) {
      throw new Error('Invalid gender');
    }
    const command = `hero gender ${gender}`;
    await this.executeCommand(command);
  }

  static async giveAll(itemType: string): Promise<void> {
    var command: string;
    switch (itemType) {
      case 'characters':
        command = `giveall avatar`;
        break;
      case 'collectibles':
        command = `giveall unlock`;
        break;
      case 'furniture':
        command = `giveall train`;
        break;
      case 'pets':
        command = `giveall pet`;
        break;
      default:
        throw new Error(`Invalid item type: ${itemType}`);
    }
    await this.executeCommand(command);
  }

  static async maxAll(itemType: string): Promise<void> {
    var command: string;
    switch (itemType) {
      case 'characterLevel':
        command = `avatar level -1 80`;
        break;
      case 'characterRank':
        command = `avatar rank -1 6`;
        break;
      case 'characterTalent':
        command = `avatar talent -1 10`;
        break;
      default:
        throw new Error(`Invalid item type: ${itemType}`);
    }
    await this.executeCommand(command);
  }

  static async unlockAll(type: string): Promise<void> {
    var command: string;
    switch (type) {
      case 'mission':
        command = `unlockall mission`;
        break;
      case 'tutorial':
        command = `unlockall tutorial`;
        break;
      case 'rogue':
        command = `unlockall rogue`;
        break;
      default:
        throw new Error(`Invalid item type: ${type}`);
    }
    await this.executeCommand(command);
  }

  static async getCurrentMissions(): Promise<Record<number, number[]>> {
    const command = `mission running`;
    const result = await this.executeCommand(command);
    return this.parseMissionLists(result);
  }

  static async finishMainMission(mainMissionId: number): Promise<string> {
    const command = `mission finishmain ${mainMissionId}`;
    const result = await this.executeCommand(command);
    return result;
  }

  static async finishSubMission(subMissionId: number): Promise<string> {
    const command = `mission finish ${subMissionId}`;
    const result = await this.executeCommand(command);
    return result;
  }

  static async acceptMainMission(mainMissionId: number): Promise<string> {
    const command = `mission reaccept ${mainMissionId}`;
    const result = await this.executeCommand(command);
    return result;
  }

  static async getPropsNearMe(): Promise<Prop[]> {
    const command = `fetch scene`;
    const result = await this.executeCommand(command);
    return this.parsePropList(result);
  }

  static async changePropState(prop: Prop, stateId: number): Promise<void> {
    const command = `scene prop ${prop.groupId} ${prop.entityId} ${stateId}`;
    await this.executeCommand(command);
  }

  static async removeUnusedRelics(): Promise<string> {
    const command = `remove relics`;
    const result = await this.executeCommand(command);
    return result;
  }

  static async removeUnusedEquipment(): Promise<string> {
    const command = `remove equipment`;
    const result = await this.executeCommand(command);
    return result;
  }

  private static parseGameText(response: string): Record<number, string> {
    const lines = response.split('\n');
    const data: Record<number, string> = {};
    for (const line of lines) {
      const [id, value] = line.split(':');
      if (id && value) {
        data[parseInt(id, 10)] = value.trim();
      }
    }
    return data;
  }

  private static parseItemList(response: string): Record<number, number> {
    const lines = response.split('\n');
    const data: Record<number, number> = {};
    for (const line of lines) {
      const [id, value] = line.split(':');
      if (id && value) {
        data[parseInt(id, 10)] = parseInt(value, 10);
      }
    }
    return data;
  }

  private static parseNumberList(response: string): number[] {
    const lines = response.split(',');
    return lines.map(line => parseInt(line.trim(), 10));
  }

  private static parseCharacterInfo(response: string): Character {
    const lines = response.split('\n');
    var result: Character = {};
    for (const line of lines) {
      const match = line.match(/\[(.*)\] (.*)/);
      if (match && match[1] && match[2]) {
        if (match[1].trim() === 'Character') {
          var charFields: { key: string, value: number }[] =
            match[2].split(',').map(field => {
              var splitted = field.trim().split(':');
              return { key: splitted[0].trim(), value: parseInt(splitted[1].trim(), 10) };
            });
          result = {
            ...result,
            pathId: charFields.find(field => field.key === 'path')?.value,
            level: charFields.find(field => field.key === 'level')?.value,
            rank: charFields.find(field => field.key === 'rank')?.value,
          };
        } else if (match[1].trim() === 'Talent') {
          var levels = match[2].trim().split('|').map(level => {
            var splitted = level.trim().split(':');
            return { [parseInt(splitted[0], 10)]: parseInt(splitted[1], 10) };
          }).reduce((acc, curr) => ({ ...acc, ...curr }), {});
          result = {
            ...result,
            talent: levels,
          }
        } else if (match[1].trim() === 'Equip') {
          var equipFields: { key: string, value: number }[] =
            match[2].split(',').map(field => {
              var splitted = field.trim().split(':');
              return { key: splitted[0], value: parseInt(splitted[1], 10) };
            });
          result = {
            ...result,
            equipId: equipFields.find(field => field.key === 'id')?.value,
            equipLevel: equipFields.find(field => field.key === 'level')?.value,
            equipRank: equipFields.find(field => field.key === 'rank')?.value,
          }
        } else if (match[1].trim().startsWith('Relic')) {
          var slot = parseInt(match[1].trim().split(' ')[1], 10);
          var fields: { key: string, value: string }[] =
            match[2].split(',').map(field => {
              var splitted = field.trim().split(':');
              return { key: splitted[0].trim(), value: splitted[1].trim() };
            });
          var subAffixes = fields.filter(field => field.key === 'subAffixes').map(field => {
            return field.value.trim().split('|').map(sub => {
              var subMatch = sub.match(/(\w+)\-(\d+)\+(\d+)/);
              return { name: subMatch![1], level: parseInt(subMatch![2], 10) + 1, step: parseInt(subMatch![3], 10) };
            });
          })[0];
          if (!result.relics) {
            result.relics = {};
          }
          result.relics[slot] = {
            relicId: parseInt(fields.find(field => field.key === 'id')?.value!, 10),
            level: parseInt(fields.find(field => field.key === 'level')?.value!, 10),
            mainAffix: fields.find(field => field.key === 'mainAffix')?.value!,
            subAffixes: subAffixes.map(sub => sub.name),
            subAffixLevels: subAffixes.map(sub => sub.level),
            subAffixSteps: subAffixes.map(sub => sub.step),
          };
        }
      }
    }
    return result;
  }

  static parseRelicRecommend(response: string): Record<number, Relic> {
    const lines = response.split('\n');
    const data: Record<number, Relic> = {};
    for (const line of lines) {
      const match = line.match(/\[(\d+)\] (.*)/);
      if (match && match[1] && match[2]) {
        const slot = parseInt(match[1], 10);
        const parts = match[2].trim().split(' ');
        const relicId = parseInt(parts[0], 10);
        const mainAffixIndex = parseInt(parts[1], 10);
        const mainAffix = MAIN_AFFIXES[slot][mainAffixIndex - 1];

        // Parse sub affixes and their levels
        const subAffixParts = parts.slice(2);
        const subAffixes: string[] = [];
        const subAffixLevels: number[] = [];

        subAffixParts.forEach(part => {
          const [index, level] = part.split(':').map(num => parseInt(num, 10));
          // The index in the input is 0-based, so we need to subtract 1
          subAffixes.push(SUB_AFFIXES[index - 1]);
          subAffixLevels.push(level);
        });

        data[slot] = {
          relicId,
          level: 15,
          mainAffix,
          subAffixes,
          subAffixLevels,
          subAffixSteps: [...subAffixLevels],
        };
      }
    }
    return data;
  }

  private static parseMissionLists(response: string): Record<number, number[]> {
    const lines = response.split('\n');
    const data: Record<number, number[]> = {};
    let currentMainId = null;
    for (const line of lines.slice(1)) {
      if (line.includes('Main task')) {
        const mainTaskMatch = line.match(/Main task (\d+).*/);
        if (mainTaskMatch && mainTaskMatch[1]) {
          currentMainId = parseInt(mainTaskMatch[1], 10);
          data[currentMainId] = [];
        }
      } else if (line.includes('Possibly stuck tasks')) {
        break;
      } else if (currentMainId) {
        const subIds = line.trim().split('、').map(Number);
        data[currentMainId].push(...subIds);
      }
    }
    return data;
  }

  static parsePropList(response: string): Prop[] {
    // Example line format: "{GroupID}-{EntityID}[{distance}]: {type} {propID} {currentState}:{currentStateId} ({states})"
    // {states} is a comma separated list of valid states in the format of "{stateDesc}:{stateId}"
    const lines = response.split('\n');
    const data: Prop[] = [];
    for (const line of lines) {
      const match = line.match(/(\d+)-(\d+)\[(\d+)\]: (\w+) (\d+) (\w+):(\d+) \((.*)\)/);
      if (match) {
        const prop: Prop = {
          groupId: parseInt(match[1], 10),
          entityId: parseInt(match[2], 10),
          propId: parseInt(match[5], 10),
          distance: parseInt(match[3], 10),
          type: match[4],
          state: match[6],
          stateId: parseInt(match[7], 10),
          validStates: Object.fromEntries(match[8].split(',').map(state => {
            const [desc, id] = state.split(':');
            return [desc, parseInt(id, 10)];
          })),
        };
        data.push(prop);
      }
    }
    return data;
  }

}

export default CommandService;

export default CommandService;

(() => {
  'use strict';

  const roles = ['MT', 'ST', 'H1', 'H2', 'D1', 'D2', 'D3', 'D4'];
  const groupStarts = new Set(['MT', 'H1', 'D1']);
  const roleGroups = {
    tank: ['MT', 'ST'],
    healer: ['H1', 'H2'],
    dps: ['D1', 'D2', 'D3', 'D4'],
  };
  const storageKey = 'string-runtime-role-map-v1';
  const dancingMadUltimateZoneId = 1363;
  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';
  const safeEncounterConfig = {
    MyDMU_AutoMarkV5: false,
    MyDMU_LocalMarkV3: false,
    MyDMU_PartyChatEnabled: false,
    MyDMU_StringNativeVfx: false,
    MyDMU_StringNativeVfxP1: false,
    MyDMU_StringNativeVfxP2: false,
    MyDMU_StringNativeVfxP3: false,
    MyDMU_StringNativeVfxP4: false,
    MyDMU_StringNativeVfxP5: false,
    MyDMU_StringNativeVfxPersonalGuide: false,
    MyDMU_P1Callout: true,
    MyDMU_P1PoisonMarkV3: false,
    MyDMU_P1BeamOrder: 'H2/H1/ST/MT/D1/D2/D3/D4',
    MyDMU_P1Line23Strategy: 'mt_st',
    MyDMU_P1TeleportStrategy: 'standard',
    MyDMU_P2TowerMarkV3: false,
    MyDMU_P2Pair2222IdleOddMode: 'role',
    MyDMU_P2OddStrategy: 'original',
    MyDMU_P2EndTowerStrategy: 'north',
    MyDMU_P2TrineDrawMode: 'preview',
    MyDMU_P2TowerCallout: false,
    MyDMU_P2ActionCallout: true,
    MyDMU_P3MahjongMarkV3: false,
    MyDMU_P3TargetMarkV3: false,
    MyDMU_P3FireBuffOrder: 'MT/ST/H1/H2/D1/D2/D3/D4',
    MyDMU_P3SuperJumpBait: 'legacy',
    MyDMU_P3KnockbackStrategy: 'legacy',
    MyDMU_P3SlapRoleSectors: true,
    MyDMU_P3SlapRouteArrow: true,
    MyDMU_P3Attack1DoubleTether: false,
    MyDMU_P3Stop2DoubleTether: false,
    MyDMU_P3TowerStrategy: 'legacy',
    MyDMU_P3TowerHeading: 'heel',
    MyDMU_P3TowerFrame: 'boss',
    MyDMU_P3TargetFirstPriority: 'D1/D2/D3/D4/MT/ST/H2/H1',
    MyDMU_P3TargetSecondPriority: 'D1/D2/D3/D4/MT/ST/H2/H1',
    MyDMU_P3TargetThirdPriority: 'MT/ST/D1/D2/D3/D4/H2/H1',
    MyDMU_P3DebuffCallout: true,
    MyDMU_P3ActionCallout: true,
    MyDMU_P4BuffMarkV3: false,
    MyDMU_P4BuffChat: true,
    MyDMU_P4BuffChatChannel: 'e',
    MyDMU_P4ElementSpreadStrategy: 'd_left',
    MyDMU_P4EyeStrategy: 'fixed',
    MyDMU_P5MitigationAlert: true,
    MyDMU_P5SymphonySpreadScheme: 'eden',
    MyDMU_P5SymphonyOrder: 'H2/D2/D4/ST/MT/D3/H1/D1',
    MyDMU_P5MitigationChannel: 'e',
    MyDMU_P5GroundFireCount: '3',
    MyDMU_P5GroundFireGuideEnabled: true,
    MyDMU_P5ForsakenGuideEnabled: true,
    MyDMU_P5ForsakenStart: '1',
  };
  const combatDisableKeys = new Set([
    'MyDMU_AutoMarkV5',
    'MyDMU_PartyChatEnabled',
    'MyDMU_P1PoisonMarkV3',
    'MyDMU_P2TowerMarkV3',
    'MyDMU_P3MahjongMarkV3',
    'MyDMU_P3TargetMarkV3',
    'MyDMU_P4BuffMarkV3',
  ]);

  const tankJobs = [1, 3, 19, 21, 32, 37];
  const healerJobs = [6, 24, 28, 33, 40];
  const dpsJobs = [2, 4, 5, 7, 20, 22, 23, 25, 26, 27, 29, 30, 31, 34, 35, 36, 38, 39, 41, 42];
  const defaultJobSort = [21, 32, 37, 19, 33, 24, 40, 28, 41, 34, 30, 39, 22, 20, 38, 23, 31, 42, 25, 27, 35, 36];
  const jobNames = {
    1: '剑术', 2: '格斗', 3: '斧术', 4: '枪术', 5: '弓术', 6: '幻术', 7: '咒术',
    19: '骑士', 20: '武僧', 21: '战士', 22: '龙骑', 23: '诗人', 24: '白魔',
    25: '黑魔', 26: '巴术', 27: '召唤', 28: '学者', 29: '双剑', 30: '忍者',
    31: '机工', 32: '暗骑',
    33: '占星', 34: '武士', 35: '赤魔', 36: '青魔', 37: '绝枪', 38: '舞者',
    39: '钐镰', 40: '贤者', 41: '蝰蛇', 42: '绘灵',
  };
  const jobIconNames = {
    1: 'gla', 2: 'pgl', 3: 'mrd', 4: 'lnc', 5: 'arc', 6: 'cnj', 7: 'thm',
    19: 'pld', 20: 'mnk', 21: 'war', 22: 'drg', 23: 'brd', 24: 'whm',
    25: 'blm', 26: 'acn', 27: 'smn', 28: 'sch', 29: 'rog', 30: 'nin',
    31: 'mch', 32: 'drk', 33: 'ast', 34: 'sam', 35: 'rdm', 36: 'blu',
    37: 'gnb', 38: 'dnc', 39: 'rpr', 40: 'sge', 41: 'vpr', 42: 'pct',
  };

  const roleSlots = document.getElementById('roleSlots');
  const slotTemplate = document.getElementById('roleSlotTemplate');
  const defaultSortButton = document.getElementById('defaultSortButton');
  const statusText = document.getElementById('statusText');
  const lastBroadcastText = document.getElementById('lastBroadcastText');
  const partySummary = document.getElementById('partySummary');
  const connectionState = document.getElementById('connectionState');
  const appShell = document.getElementById('appShell');
  const viewTitle = document.getElementById('viewTitle');
  const rolesPanel = document.getElementById('rolesPanel');
  const configPanel = document.getElementById('configPanel');
  const rolesTab = document.getElementById('rolesTab');
  const configTab = document.getElementById('configTab');
  const configTabDot = document.getElementById('configTabDot');
  const configHint = document.getElementById('configHint');
  const configStateBadge = document.getElementById('configStateBadge');
  const configProfileSelect = document.getElementById('configProfileSelect');
  const profileNameInput = document.getElementById('profileNameInput');
  const saveProfileButton = document.getElementById('saveProfileButton');
  const restoreDefaultsButton = document.getElementById('restoreDefaultsButton');
  const profileMemoryState = document.getElementById('profileMemoryState');
  const activeProfileStatus = document.getElementById('activeProfileStatus');
  const dirtyState = document.getElementById('dirtyState');
  const configError = document.getElementById('configError');
  const applyConfigButton = document.getElementById('applyConfigButton');
  const configControls = [...document.querySelectorAll('[data-config-key]')];
  const configControlByKey = Object.fromEntries(configControls.map((control) =>
    [control.dataset.configKey, control]));
  const p2EightTowerPreset = document.getElementById('p2EightTowerPreset');
  const phaseTabs = [...document.querySelectorAll('[data-phase]')];
  const phasePanels = [...document.querySelectorAll('[data-phase-panel]')];

  let party = [];
  let roleByName = readJson(storageKey, {});
  let pendingBroadcastTimer;
  let pointerDragState;
  let currentPlayerName = '';
  let overlayConnected = false;
  let activeView = 'roles';
  let activePhase = 'p1';
  let compactMode = true;
  let pointerInside = false;
  let compactTimer;
  let selectInteraction;
  let selectInteractionTimer;
  let resizeScheduleToken = 0;
  let resizeRequestSequence = 0;
  let resizeQueue = Promise.resolve();
  let lastResizeKey = '';
  let resizeErrorMessage = '';
  let configDirty = false;
  let configSaveTimer;
  let configSavePromise = Promise.resolve();
  let configFormInitialized = false;
  let configBackendAvailable = false;
  let demoDispatchOverlayEvent;
  let encounterState = {
    zoneId: 0,
    zoneName: '',
    inEncounter: false,
    confirmed: false,
    locked: false,
    revision: 0,
    config: { ...safeEncounterConfig },
    draftConfig: { ...safeEncounterConfig },
    activeProfileId: 'default',
    profiles: [{ id: 'default', name: '默认配置' }],
    safeDefaults: { ...safeEncounterConfig },
    configSchemaVersion: 0,
    features: {},
    hasPendingChanges: false,
  };
  const overlayReadyCallbacks = [];

  const hasOverlayApi = () =>
    typeof window.addOverlayListener === 'function' &&
    typeof window.callOverlayHandler === 'function';

  function markOverlayReady() {
    if (overlayConnected)
      return;
    overlayConnected = true;
    for (const callback of overlayReadyCallbacks.splice(0)) {
      try {
        callback();
      } catch (error) {
        console.error(error);
      }
    }
  }

  function onOverlayReady(callback) {
    if (overlayConnected) {
      callback();
      return;
    }
    overlayReadyCallbacks.push(callback);
  }

  function installDemoOverlayApi() {
    if (!demoMode || hasOverlayApi())
      return;

    const subscribers = {};
    const demoProfiles = [
      { id: 'default', name: '默认配置', config: { ...safeEncounterConfig } },
      {
        id: 'progression',
        name: '开荒配置',
        config: { ...safeEncounterConfig, MyDMU_P2TowerCallout: true },
      },
      {
        id: 'static',
        name: '固定队配置',
        config: {
          ...safeEncounterConfig,
          MyDMU_P2OddStrategy: 'melee',
          MyDMU_P4BuffChatChannel: 'p',
          MyDMU_P5SymphonySpreadScheme: 'omega',
        },
      },
    ];
    let activeProfileId = 'static';
    let draftConfig = { ...demoProfiles.find((profile) => profile.id === activeProfileId).config };
    let state = {
      ...encounterState,
      configSchemaVersion: 3,
      features: { partyChatEnabled: true },
      draftConfig: { ...draftConfig },
      activeProfileId,
      profiles: demoProfiles.map(({ id, name }) => ({ id, name })),
    };

    const updateDemoState = (changes = {}) => {
      state = {
        ...state,
        ...changes,
        draftConfig: { ...draftConfig },
        activeProfileId,
        profiles: demoProfiles.map(({ id, name }) => ({ id, name })),
      };
      state.hasPendingChanges = state.inEncounter &&
        JSON.stringify(state.config) !== JSON.stringify(state.draftConfig);
    };

    const saveActiveDemoProfile = () => {
      const active = demoProfiles.find((profile) => profile.id === activeProfileId);
      if (active !== undefined)
        active.config = { ...draftConfig };
    };

    const dispatch = (event) => {
      for (const callback of subscribers[event.type] ?? [])
        callback(event);
    };
    demoDispatchOverlayEvent = dispatch;

    window.addOverlayListener = (event, callback) => {
      subscribers[event] ??= [];
      subscribers[event].push(callback);
    };
    window.callOverlayHandler = async (request) => {
      if (request.call === 'getCombatants') {
        return {
          combatants: [
            { ID: 0x10000001, Name: '苍穹之盾', Job: 21 },
            { ID: 0x10000002, Name: '夜色回响', Job: 32 },
            { ID: 0x10000003, Name: '晨星祷言', Job: 24 },
            { ID: 0x10000004, Name: '月海占星', Job: 33 },
            { ID: 0x10000005, Name: '风切之刃', Job: 41 },
            { ID: 0x10000006, Name: '白露太刀', Job: 34 },
            { ID: 0x10000007, Name: '远空乐章', Job: 38 },
            { ID: 0x10000008, Name: '星墨绘卷', Job: 42 },
          ],
        };
      }
      if (request.call !== 'stringConfig')
        return { ok: true };

      if (request.action === 'resizeOverlay') {
        const width = Math.max(1, Math.round(Number(request.width) || 0));
        const height = Math.max(1, Math.round(Number(request.height) || 0));
        return {
          ok: true,
          mode: request.mode,
          appliedWidth: width,
          appliedHeight: height,
        };
      }

      const draftActions = new Set(['update', 'selectProfile', 'saveProfile', 'reset']);
      if (state.locked && draftActions.has(request.action))
        return { ok: false, error: '战斗中设置已锁定，请脱战后修改' };

      if (request.action === 'enterZone') {
        const zoneId = Number(request.zoneId ?? 0);
        if (zoneId !== state.zoneId) {
          updateDemoState({
            zoneId,
            zoneName: request.zoneName ?? '',
            inEncounter: zoneId === dancingMadUltimateZoneId,
            confirmed: zoneId === dancingMadUltimateZoneId,
            locked: false,
            revision: state.revision + 1,
            config: zoneId === dancingMadUltimateZoneId
              ? { ...draftConfig }
              : { ...safeEncounterConfig },
          });
          dispatch({ type: 'StringConfigChanged', state });
        }
      } else if (request.action === 'setCombat') {
        const locked = state.inEncounter && Boolean(request.inCombat);
        if (locked !== state.locked) {
          updateDemoState({ locked, revision: state.revision + 1 });
          dispatch({ type: 'StringConfigChanged', state });
        }
      } else if (request.action === 'disableCombatOption') {
        const key = typeof request.key === 'string' ? request.key.trim() : '';
        if (!state.inEncounter || !state.locked)
          return { ok: false, error: '仅绝妖星战斗中可关闭已开启的安全开关' };
        if (!combatDisableKeys.has(key))
          return { ok: false, error: `战斗中不能修改该设置：${key}` };
        if (state.config[key] === true || draftConfig[key] === true) {
          draftConfig = { ...draftConfig, [key]: false };
          saveActiveDemoProfile();
          updateDemoState({
            config: { ...state.config, [key]: false },
            revision: state.revision + 1,
          });
          dispatch({ type: 'StringConfigChanged', state });
        }
      } else if (request.action === 'update') {
        draftConfig = { ...safeEncounterConfig, ...request.config };
        saveActiveDemoProfile();
        updateDemoState({ revision: state.revision + 1 });
        dispatch({ type: 'StringConfigChanged', state });
      } else if (request.action === 'selectProfile') {
        const profile = demoProfiles.find((item) => item.id === request.profileId);
        if (profile === undefined)
          return { ok: false, error: '配置档案不存在' };
        activeProfileId = profile.id;
        draftConfig = { ...profile.config };
        updateDemoState({ revision: state.revision + 1 });
        dispatch({ type: 'StringConfigChanged', state });
      } else if (request.action === 'saveProfile') {
        const name = request.name?.trim();
        if (!name)
          return { ok: false, error: '请输入配置名称' };
        draftConfig = { ...safeEncounterConfig, ...request.config };
        let profile = demoProfiles.find((item) => item.name.toLowerCase() === name.toLowerCase());
        if (profile === undefined) {
          profile = { id: `profile-${Date.now()}`, name, config: { ...draftConfig } };
          demoProfiles.push(profile);
        } else {
          profile.name = name;
          profile.config = { ...draftConfig };
        }
        activeProfileId = profile.id;
        updateDemoState({ revision: state.revision + 1 });
        dispatch({ type: 'StringConfigChanged', state });
      } else if (request.action === 'reset') {
        draftConfig = { ...safeEncounterConfig };
        saveActiveDemoProfile();
        updateDemoState({ revision: state.revision + 1 });
        dispatch({ type: 'StringConfigChanged', state });
      } else if (request.action === 'apply') {
        if (!state.inEncounter)
          return { ok: false, error: '当前不在绝妖星，进入副本后才能应用本次配置' };
        if (state.locked)
          return { ok: false, error: '战斗中设置已锁定，请脱战后修改' };
        const config = { ...safeEncounterConfig, ...request.config };
        draftConfig = { ...config };
        saveActiveDemoProfile();
        updateDemoState({
          confirmed: true,
          revision: state.revision + 1,
          config,
        });
        dispatch({ type: 'StringConfigChanged', state });
      }
      return { ok: true, state };
    };
    window.startOverlayEvents = () => {};
  }

  function installOverlayApi() {
    if (hasOverlayApi()) {
      markOverlayReady();
      return;
    }

    let initialized = false;
    let ws = null;
    let queue = [];
    let responseSequence = 0;
    const responsePromises = {};
    const subscribers = {};

    const processEvent = (message) => {
      const listeners = subscribers[message?.type] ?? [];
      for (const listener of listeners) {
        try {
          listener(message);
        } catch (error) {
          console.error(error);
        }
      }
    };

    const sendMessage = (message, callback) => {
      if (ws !== null) {
        if (queue !== null)
          queue.push(message);
        else
          ws.send(JSON.stringify(message));
        return;
      }

      if (queue !== null) {
        queue.push([message, callback]);
        return;
      }

      window.OverlayPluginApi.callHandler(JSON.stringify(message), callback);
    };

    const flushQueue = () => {
      const pending = queue ?? [];
      queue = null;
      sendMessage({ call: 'subscribe', events: Object.keys(subscribers) });
      for (const item of pending) {
        if (Array.isArray(item))
          sendMessage(item[0], item[1]);
        else
          sendMessage(item);
      }
    };

    const connectWebSocket = (wsUrl) => {
      ws = new WebSocket(wsUrl);
      ws.addEventListener('open', () => {
        markOverlayReady();
        flushQueue();
      });
      ws.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data);
          const promise = message?.rseq === undefined ? undefined : responsePromises[message.rseq];
          if (promise !== undefined) {
            if (message.$error)
              promise.reject(message);
            else
              promise.resolve(message);
            delete responsePromises[message.rseq];
            return;
          }
          processEvent(message);
        } catch (error) {
          console.error(error);
        }
      });
      ws.addEventListener('close', () => {
        ws = null;
        queue ??= [];
        window.setTimeout(() => connectWebSocket(wsUrl), 1000);
      });
      ws.addEventListener('error', (error) => console.error(error));
    };

    const waitForOverlayPluginApi = () => {
      if (!window.OverlayPluginApi?.ready) {
        window.setTimeout(waitForOverlayPluginApi, 300);
        return;
      }
      window.__OverlayCallback = processEvent;
      markOverlayReady();
      flushQueue();
    };

    const init = () => {
      if (initialized)
        return;
      initialized = true;
      const wsUrl = new URLSearchParams(window.location.search).get('OVERLAY_WS');
      if (wsUrl !== null && wsUrl !== '') {
        connectWebSocket(wsUrl);
        return;
      }
      waitForOverlayPluginApi();
    };

    window.addOverlayListener = (event, callback) => {
      init();
      subscribers[event] ??= [];
      subscribers[event].push(callback);
      if (queue === null)
        sendMessage({ call: 'subscribe', events: [event] });
    };
    window.callOverlayHandler = (message) => {
      init();
      const request = { ...message, rseq: 0 };
      if (ws !== null) {
        request.rseq = responseSequence++;
        const promise = new Promise((resolve, reject) => {
          responsePromises[request.rseq] = { resolve, reject };
        });
        sendMessage(request);
        return promise;
      }
      return new Promise((resolve, reject) => {
        sendMessage(request, (data) => {
          if (data === null) {
            resolve(data);
            return;
          }
          const parsed = JSON.parse(data);
          if (parsed.$error)
            reject(parsed);
          else
            resolve(parsed);
        });
      });
    };
    window.dispatchOverlayEvent = processEvent;
  }

  function readJson(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function cleanName(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function normalizeMember(member) {
    return {
      id: member.id ?? member.ID ?? '',
      name: cleanName(member.name ?? member.Name),
      job: Number(member.job ?? member.Job ?? 0),
      inParty: member.inParty ?? member.InParty ?? true,
      rp: undefined,
    };
  }

  function sortScore(member) {
    const index = defaultJobSort.indexOf(Number(member.job));
    return index < 0 ? 999 : index;
  }

  function getJobGroup(job) {
    if (tankJobs.includes(Number(job)))
      return 'tank';
    if (healerJobs.includes(Number(job)))
      return 'healer';
    if (dpsJobs.includes(Number(job)))
      return 'dps';
  }

  function getCompatibleRoles(member) {
    return roleGroups[getJobGroup(member.job)] ?? [];
  }

  function isRoleCompatible(member, role) {
    return getCompatibleRoles(member).includes(role);
  }

  function assignDefaultRoles(members) {
    const sorted = [...members].sort((left, right) => sortScore(left) - sortScore(right));
    const counters = { tank: 0, healer: 0, dps: 0 };

    for (const member of sorted) {
      member.rp = undefined;
      const group = getJobGroup(member.job);
      if (group === undefined)
        continue;
      member.rp = roleGroups[group][counters[group]++] ?? undefined;
    }
  }

  function applyStoredRoles() {
    const used = new Set();
    for (const member of party) {
      if (member.name === '') {
        member.rp = undefined;
        continue;
      }
      const savedRole = roleByName[member.name];
      if (isRoleCompatible(member, savedRole) && !used.has(savedRole)) {
        member.rp = savedRole;
        used.add(savedRole);
      } else {
        member.rp = undefined;
      }
    }

    const missingMembers = party.filter((member) => member.rp === undefined);
    if (missingMembers.length === 0)
      return;

    const defaultParty = party.map((member) => ({ ...member, rp: undefined }));
    assignDefaultRoles(defaultParty);
    const defaultRoleByName = new Map(defaultParty.filter((member) => member.name !== '').map((member) => [member.name, member.rp]));
    for (const member of missingMembers) {
      const preferred = defaultRoleByName.get(member.name);
      if (isRoleCompatible(member, preferred) && !used.has(preferred)) {
        member.rp = preferred;
        used.add(preferred);
        continue;
      }
      const fallback = getCompatibleRoles(member).find((role) => !used.has(role));
      member.rp = fallback;
      if (fallback !== undefined)
        used.add(fallback);
    }
  }

  function saveRoles() {
    roleByName = Object.fromEntries(
      party
        .filter((member) => member.name !== '' && isRoleCompatible(member, member.rp))
        .map((member) => [member.name, member.rp]),
    );
    writeJson(storageKey, roleByName);
  }

  function setParty(rawParty) {
    party = (rawParty ?? [])
      .map(normalizeMember)
      .filter((member) => member.inParty && (member.name !== '' || member.job > 0))
      .slice(0, 8);
    applyStoredRoles();
    saveRoles();
    render();
    scheduleBroadcast(true);
  }

  function getMemberByRole(role) {
    return party.find((member) => member.rp === role);
  }

  function createMemberSelect(role, selectedName) {
    const select = document.createElement('select');
    select.className = 'member-select';
    select.setAttribute('aria-label', `${role} 队员`);

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '未分配';
    select.append(emptyOption);

    for (const member of party) {
      if (member.name === '' || !isRoleCompatible(member, role))
        continue;
      const option = document.createElement('option');
      option.value = member.name;
      option.textContent = member.name;
      select.append(option);
    }

    select.value = selectedName ?? '';
    select.addEventListener('change', () => assignMemberToRole(select.value, role));
    bindSelectInteraction(select);
    return select;
  }

  function assignMemberToRole(memberName, nextRole) {
    const currentMember = getMemberByRole(nextRole);
    const nextMember = party.find((member) => member.name === memberName);

    if (nextMember !== undefined && !isRoleCompatible(nextMember, nextRole))
      return;

    if (currentMember !== undefined && nextMember === undefined) {
      currentMember.rp = undefined;
    } else if (nextMember !== undefined) {
      const previousRole = nextMember.rp;
      nextMember.rp = nextRole;
      if (currentMember !== undefined && currentMember !== nextMember)
        currentMember.rp = previousRole;
    }

    saveRoles();
    render();
    scheduleBroadcast();
  }

  function swapRoleSlots(sourceRole, targetRole) {
    if (sourceRole === targetRole)
      return;
    const sourceMember = getMemberByRole(sourceRole);
    const targetMember = getMemberByRole(targetRole);
    if (sourceMember === undefined)
      return;
    if (!isRoleCompatible(sourceMember, targetRole))
      return;
    if (targetMember !== undefined && !isRoleCompatible(targetMember, sourceRole))
      return;

    sourceMember.rp = targetRole;
    if (targetMember !== undefined)
      targetMember.rp = sourceRole;

    saveRoles();
    render();
    scheduleBroadcast();
  }

  function getDuplicateRoles() {
    const count = new Map();
    for (const member of party) {
      if (member.rp === undefined)
        continue;
      count.set(member.rp, (count.get(member.rp) ?? 0) + 1);
    }
    return new Set([...count.entries()].filter(([, value]) => value > 1).map(([role]) => role));
  }

  function render() {
    roleSlots.replaceChildren();
    const duplicateRoles = getDuplicateRoles();

    for (const role of roles) {
      const member = getMemberByRole(role);
      const slot = slotTemplate.content.firstElementChild.cloneNode(true);
      slot.dataset.role = role;
      slot.dataset.groupStart = String(groupStarts.has(role));
      slot.draggable = false;
      slot.classList.toggle('empty', member === undefined || member.name === '');
      slot.classList.toggle('duplicate', duplicateRoles.has(role));
      slot.classList.toggle('self', member?.name === currentPlayerName);
      slot.querySelector('.role-chip').textContent = role;
      const jobIcon = slot.querySelector('.job-icon');
      const jobIconName = member === undefined ? undefined : jobIconNames[member.job];
      jobIcon.hidden = jobIconName === undefined;
      if (jobIconName !== undefined) {
        jobIcon.src = `./assets/jobs/${jobIconName}.png`;
        jobIcon.title = jobNames[member.job] ?? `Job ${member.job}`;
      }
      const memberName = slot.querySelector('.member-name');
      memberName.textContent = member?.name ?? '';
      memberName.tabIndex = member?.name === undefined || member.name === '' ? -1 : 0;
      slot.querySelector('.member-job').textContent = member === undefined || member.job <= 0 ? '' : jobNames[member.job] ?? `Job ${member.job}`;
      const select = createMemberSelect(role, member?.name);
      memberName.addEventListener('keydown', (event) => {
        if (member?.name === undefined || member.name === '')
          return;
        if (event.key !== 'Enter' && event.key !== ' ')
          return;
        event.preventDefault();
        openMemberSelect(select);
      });
      slot.querySelector('.member-select').replaceWith(select);
      bindPointerDrag(memberName, select, slot, role);
      roleSlots.append(slot);
    }

    const assignedRoleCount = new Set(party.map((member) => member.rp).filter(Boolean)).size;
    const missingRoles = roles.filter((role) => getMemberByRole(role) === undefined);
    const unassignedMembers = party.filter((member) => member.name !== '' && member.rp === undefined);
    partySummary.textContent = party.length > 0 ? `${party.length} 人 / ${assignedRoleCount} 职能` : '等待小队数据';
    if (party.length === 0)
      statusText.textContent = overlayConnected ? '已连接 OverlayPlugin，等待小队数据。' : '未获取到小队数据，仅显示职能。';
    else if (duplicateRoles.size > 0)
      statusText.textContent = `存在重复职能：${[...duplicateRoles].join('/')}`;
    else if (unassignedMembers.length > 0)
      statusText.textContent = `职业无法匹配职能：${unassignedMembers.map((member) => member.name).join('、')}`;
    else if (missingRoles.length > 0)
      statusText.textContent = `未分配：${missingRoles.join('/')}`;
    else
      statusText.textContent = '拖拽玩家或点击名字调整职能。';
  }

  function openMemberSelect(select) {
    beginSelectInteraction(select);
    try {
      select.focus({ preventScroll: true });
    } catch {
      select.focus();
    }
    if (typeof select.showPicker !== 'function')
      return;
    try {
      select.showPicker();
    } catch {
      // showPicker only works during direct user activation on some Chromium versions.
    }
  }

  function bindPointerDrag(handle, select, slot, role) {
    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || getMemberByRole(role) === undefined)
        return;
      pointerDragState = {
        active: false,
        pointerId: event.pointerId,
        role,
        slot,
        startX: event.clientX,
        startY: event.clientY,
      };
      handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener('pointermove', (event) => {
      if (pointerDragState === undefined || pointerDragState.pointerId !== event.pointerId)
        return;
      const xDistance = event.clientX - pointerDragState.startX;
      const yDistance = event.clientY - pointerDragState.startY;
      if (!pointerDragState.active && Math.hypot(xDistance, yDistance) < 8)
        return;

      pointerDragState.active = true;
      event.preventDefault();
      pointerDragState.slot.classList.add('dragging');
      const targetSlot = document.elementFromPoint(event.clientX, event.clientY)?.closest('.role-slot');
      for (const candidate of roleSlots.querySelectorAll('.role-slot'))
        candidate.classList.toggle('drag-over', candidate === targetSlot && targetSlot.dataset.role !== pointerDragState.role);
    });

    handle.addEventListener('pointerup', (event) => {
      if (pointerDragState === undefined || pointerDragState.pointerId !== event.pointerId)
        return;
      const state = pointerDragState;
      const targetSlot = document.elementFromPoint(event.clientX, event.clientY)?.closest('.role-slot');
      clearPointerDrag();
      if (!state.active) {
        openMemberSelect(select);
        return;
      }
      event.preventDefault();
      const targetRole = targetSlot?.dataset.role;
      if (targetRole !== undefined)
        swapRoleSlots(state.role, targetRole);
    });

    handle.addEventListener('pointercancel', clearPointerDrag);
  }

  function clearPointerDrag() {
    pointerDragState = undefined;
    for (const slot of roleSlots.querySelectorAll('.role-slot'))
      slot.classList.remove('dragging', 'drag-over');
    scheduleCompactMode();
  }

  function defaultSort() {
    assignDefaultRoles(party);
    saveRoles();
    render();
    scheduleBroadcast();
  }

  function buildPayload() {
    return party
      .filter((member) => member.name !== '' && isRoleCompatible(member, member.rp))
      .map((member) => ({
        id: member.id,
        name: member.name,
        rp: member.rp,
      }));
  }

  function broadcast() {
    clearTimeout(pendingBroadcastTimer);
    const payload = buildPayload();
    if (overlayConnected && hasOverlayApi()) {
      window.callOverlayHandler({
        call: 'broadcast',
        source: 'stringRuntimeJS',
        msg: { party: payload },
      });
    } else {
      statusText.textContent = 'OverlayPlugin 未连接，未广播。';
      return;
    }
    const now = new Date();
    lastBroadcastText.textContent = `已广播 ${now.toLocaleTimeString('zh-CN', { hour12: false })}`;
    if (payload.length === 0)
      statusText.textContent = '暂无小队数据，未广播职能状态。';
  }

  function scheduleBroadcast() {
    clearTimeout(pendingBroadcastTimer);
    pendingBroadcastTimer = setTimeout(broadcast, 120);
  }

  function handleBroadcastMessage(message) {
    const text = message?.msg?.text;
    if ((message?.source === 'stringUserJS' || message?.source === 'soumaUserJS') && text === 'requestData')
      broadcast();
  }

  function handlePrimaryPlayer(event) {
    currentPlayerName = cleanName(event?.charName ?? event?.name);
    render();
  }

  function getCombatantId(combatant) {
    const id = combatant.ID ?? combatant.id;
    if (typeof id === 'number')
      return id.toString(16).toUpperCase().padStart(8, '0');
    return id?.toString() ?? '';
  }

  function partyFromCombatants(combatants) {
    const knownJobs = new Set([...tankJobs, ...healerJobs, ...dpsJobs]);
    const players = (combatants ?? [])
      .filter((combatant) => knownJobs.has(Number(combatant.Job ?? combatant.job ?? 0)))
      .map((combatant) => ({
        id: getCombatantId(combatant),
        name: cleanName(combatant.Name ?? combatant.name),
        job: Number(combatant.Job ?? combatant.job ?? 0),
        inParty: true,
      }))
      .filter((member) => member.name !== '');

    if (players.length === 0 || players.length > 8)
      return [];
    return players;
  }

  async function requestPartySnapshot() {
    if (!overlayConnected || !hasOverlayApi())
      return;
    try {
      const result = await window.callOverlayHandler({ call: 'getCombatants' });
      const snapshotParty = partyFromCombatants(result?.combatants);
      if (snapshotParty.length > 0 && party.length === 0)
        setParty(snapshotParty);
    } catch (error) {
      console.debug('String Runtime getCombatants failed', error);
    }
  }

  function currentLayoutMode() {
    return compactMode ? 'compact' : activeView;
  }

  function measureOverlayLayout() {
    const bounds = appShell.getBoundingClientRect();
    return {
      width: Math.ceil(Math.max(appShell.scrollWidth, bounds.width) + 2),
      height: Math.ceil(Math.max(appShell.scrollHeight, bounds.height) + 2),
    };
  }

  function updateResizeFallback(mode, requested, result, requestSequence) {
    if (requestSequence !== resizeRequestSequence)
      return;
    const appliedWidth = Number(result?.appliedWidth);
    const appliedHeight = Number(result?.appliedHeight);
    const acknowledged = result?.ok === true &&
      Number.isFinite(appliedWidth) && Number.isFinite(appliedHeight);
    const clipped = !acknowledged ||
      appliedWidth + 12 < requested.width || appliedHeight + 12 < requested.height;
    document.documentElement.classList.toggle('resize-fallback', mode === 'config' && clipped);
  }

  async function requestOverlayLayout(mode, requested, requestSequence) {
    let result;
    let failureMessage = '';
    try {
      result = await window.callOverlayHandler({
        call: 'stringConfig',
        action: 'resizeOverlay',
        mode,
        width: requested.width,
        height: requested.height,
      });
    } catch (error) {
      failureMessage = error?.message ?? String(error);
    }
    if (result?.ok !== true) {
      failureMessage ||= result?.error ?? 'StringDownloader 未返回窗口尺寸';
      console.warn('String Runtime overlay resize failed:', failureMessage);
      if (mode === 'config') {
        resizeErrorMessage = `窗口自动调整失败：${failureMessage}`;
        configError.textContent = resizeErrorMessage;
      }
    } else if (mode === 'config' && resizeErrorMessage !== '') {
      if (configError.textContent === resizeErrorMessage)
        configError.textContent = '';
      resizeErrorMessage = '';
    }
    updateResizeFallback(mode, requested, result, requestSequence);
  }

  function scheduleOverlayResize(resetFallback = false) {
    if (resetFallback)
      document.documentElement.classList.remove('resize-fallback');
    const scheduleToken = ++resizeScheduleToken;
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      if (scheduleToken !== resizeScheduleToken || typeof window.callOverlayHandler !== 'function')
        return;
      const mode = currentLayoutMode();
      const requested = measureOverlayLayout();
      const resizeKey = `${mode}:${requested.width}x${requested.height}`;
      if (!resetFallback && resizeKey === lastResizeKey)
        return;
      lastResizeKey = resizeKey;
      const requestSequence = ++resizeRequestSequence;
      const resize = () => requestOverlayLayout(mode, requested, requestSequence);
      resizeQueue = resizeQueue.then(resize, resize);
    }));
  }

  function renderActiveView(resetFallback = false) {
    const renderedView = compactMode ? 'roles' : activeView;
    appShell.dataset.compact = compactMode ? 'true' : 'false';
    appShell.dataset.view = renderedView;
    rolesPanel.hidden = renderedView !== 'roles';
    configPanel.hidden = renderedView !== 'config';
    rolesTab.classList.toggle('active', activeView === 'roles');
    configTab.classList.toggle('active', activeView === 'config');
    viewTitle.textContent = activeView === 'config' ? '本次设置' : '职能分配';
    scheduleOverlayResize(resetFallback);
  }

  function setCompactMode(compact) {
    const nextCompactMode = Boolean(compact);
    if (compactMode === nextCompactMode)
      return;
    compactMode = nextCompactMode;
    if (compactMode && appShell.contains(document.activeElement))
      document.activeElement.blur();
    renderActiveView(true);
  }

  function scheduleCompactMode() {
    clearTimeout(compactTimer);
    if (pointerInside || pointerDragState !== undefined || selectInteraction !== undefined)
      return;
    compactTimer = window.setTimeout(() => {
      if (!pointerInside && pointerDragState === undefined && selectInteraction === undefined)
        setCompactMode(true);
    }, 180);
  }

  function endSelectInteraction(select) {
    if (selectInteraction !== select)
      return;
    selectInteraction = undefined;
    clearTimeout(selectInteractionTimer);
    scheduleCompactMode();
  }

  function beginSelectInteraction(select) {
    selectInteraction = select;
    clearTimeout(compactTimer);
    clearTimeout(selectInteractionTimer);
    selectInteractionTimer = window.setTimeout(() => endSelectInteraction(select), 30000);
  }

  function bindSelectInteraction(select) {
    select.addEventListener('pointerdown', () => beginSelectInteraction(select));
    select.addEventListener('change', () => window.setTimeout(() => endSelectInteraction(select), 0));
    select.addEventListener('blur', () => endSelectInteraction(select));
    select.addEventListener('keydown', (event) => {
      if (event.key === 'Escape')
        window.setTimeout(() => endSelectInteraction(select), 0);
    });
  }

  function setView(view) {
    activeView = view === 'config' ? 'config' : 'roles';
    renderActiveView(true);
  }

  function setActivePhase(phase) {
    activePhase = phaseTabs.some((tab) => tab.dataset.phase === phase) ? phase : 'p1';
    for (const tab of phaseTabs) {
      const selected = tab.dataset.phase === activePhase;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
    }
    for (const panel of phasePanels)
      panel.hidden = panel.dataset.phasePanel !== activePhase;
    scheduleOverlayResize(true);
  }

  function writeConfigToForm(config) {
    const values = { ...safeEncounterConfig, ...config };
    for (const control of configControls) {
      const value = values[control.dataset.configKey];
      if (control.type === 'checkbox')
        control.checked = Boolean(value);
      else if (value !== undefined)
        control.value = value;
    }
    syncP2EightTowerPreset(values);
    configFormInitialized = true;
    configDirty = false;
  }

  function readConfigFromForm() {
    const partyChatSupported = encounterState.features?.partyChatEnabled === true;
    return Object.fromEntries(configControls
      .filter((control) => control.dataset.configKey !== 'MyDMU_PartyChatEnabled' || partyChatSupported)
      .map((control) => [
      control.dataset.configKey,
      control.type === 'checkbox' ? control.checked : control.value.trim(),
      ]));
  }

  function p2EightTowerPresetFor(values) {
    const idleMode = values.MyDMU_P2Pair2222IdleOddMode;
    const oddStrategy = values.MyDMU_P2OddStrategy;
    if (idleMode === 'role' && oddStrategy === 'original')
      return 'role_fixed';
    if (idleMode === 'cone' && oddStrategy === 'original')
      return 'fan_steel';
    if (idleMode === 'role' && oddStrategy === 'melee')
      return 'uptime';
    return 'custom';
  }

  function syncP2EightTowerPreset(values = readConfigFromForm()) {
    if (p2EightTowerPreset !== null)
      p2EightTowerPreset.value = p2EightTowerPresetFor(values);
  }

  function applyP2EightTowerPreset() {
    const mapping = {
      role_fixed: ['role', 'original'],
      fan_steel: ['cone', 'original'],
      uptime: ['role', 'melee'],
    }[p2EightTowerPreset?.value];
    if (mapping === undefined) {
      syncP2EightTowerPreset();
      return;
    }
    configControlByKey.MyDMU_P2Pair2222IdleOddMode.value = mapping[0];
    configControlByKey.MyDMU_P2OddStrategy.value = mapping[1];
    syncP2EightTowerPreset();
    scheduleDraftSave();
  }

  function getActiveProfile() {
    return encounterState.profiles.find((profile) => profile.id === encounterState.activeProfileId);
  }

  function renderProfileOptions() {
    const selectedId = encounterState.activeProfileId;
    configProfileSelect.replaceChildren(...encounterState.profiles.map((profile) => {
      const option = document.createElement('option');
      option.value = profile.id;
      option.textContent = profile.name;
      option.selected = profile.id === selectedId;
      return option;
    }));
  }

  function isCombatDisableEnabled(key) {
    return encounterState.config?.[key] === true || encounterState.draftConfig?.[key] === true;
  }

  function renderConfigState() {
    const editable = configBackendAvailable && !encounterState.locked;
    const canApply = editable && encounterState.inEncounter;
    const activeProfile = getActiveProfile();
    const hasPendingChanges = configDirty || encounterState.hasPendingChanges;
    configPanel.classList.toggle('locked', encounterState.locked);
    for (const control of configControls) {
      const key = control.dataset.configKey;
      const supported = key !== 'MyDMU_PartyChatEnabled' ||
        encounterState.features?.partyChatEnabled === true;
      const combatDisable = encounterState.locked &&
        control.type === 'checkbox' && combatDisableKeys.has(key);
      const canDisableInCombat = configBackendAvailable && supported && combatDisable &&
        isCombatDisableEnabled(key);
      if (combatDisable)
        control.checked = canDisableInCombat;
      control.disabled = !supported || (!editable && !canDisableInCombat);
      control.title = supported ? '' : '需要更新 StringDownloader 后使用';
    }
    if (p2EightTowerPreset !== null)
      p2EightTowerPreset.disabled = !editable;
    configProfileSelect.disabled = !editable;
    profileNameInput.disabled = !editable;
    saveProfileButton.disabled = !editable || profileNameInput.value.trim() === '';
    restoreDefaultsButton.disabled = !editable;
    applyConfigButton.disabled = !canApply || !hasPendingChanges;
    applyConfigButton.textContent = encounterState.inEncounter ? '应用本次' : '进本后可应用';
    applyConfigButton.title = encounterState.inEncounter ? '' : '进入绝妖星后可应用到当前副本';
    profileMemoryState.textContent = encounterState.locked
      ? '战斗中仅可关闭标点与小队消息'
      : configDirty
        ? '正在记忆修改…'
        : encounterState.inEncounter ? '修改会自动记忆' : '进本时自动载入';
    activeProfileStatus.textContent = activeProfile === undefined
      ? '尚无配置档案'
      : `当前：${activeProfile.name}`;

    configTabDot.className = 'tab-dot';
    if (encounterState.inEncounter)
      configTabDot.classList.add(hasPendingChanges ? 'pending' : 'applied');

    if (!configBackendAvailable) {
      configStateBadge.textContent = '等待桥接';
      configStateBadge.className = 'config-state state-waiting';
      configHint.textContent = '需要本地 StringDownloader 0.8.9 或更高版本的方案配置桥接。';
      dirtyState.textContent = '下崽器配置桥接尚未连接';
    } else if (!encounterState.inEncounter) {
      configStateBadge.textContent = '未进本';
      configStateBadge.className = 'config-state state-waiting';
      configHint.textContent = `可预先编辑“${activeProfile?.name ?? '默认配置'}”；进入绝妖星后自动载入。`;
      dirtyState.textContent = configDirty ? '正在保存到配置档案…' : '已保存到配置档案；进本后自动载入';
    } else if (encounterState.locked) {
      configStateBadge.textContent = '战斗中';
      configStateBadge.className = 'config-state state-locked';
      configHint.textContent = '战斗中仅可关闭已开启的自动标点或小队消息；关闭后立即阻止后续发送。';
      dirtyState.textContent = '方案已锁定；标点与小队消息可关闭';
    } else if (hasPendingChanges) {
      configStateBadge.textContent = '待应用';
      configStateBadge.className = 'config-state state-waiting';
      configHint.textContent = `当前使用“${activeProfile?.name ?? '默认配置'}”；修改会自动记忆。`;
      dirtyState.textContent = configDirty ? '正在记忆修改…' : '修改已记忆，点击“应用本次”生效';
    } else {
      configStateBadge.textContent = '本次已应用';
      configStateBadge.className = 'config-state state-applied';
      configHint.textContent = `当前使用“${activeProfile?.name ?? '默认配置'}”；修改会自动记忆。`;
      dirtyState.textContent = '当前配置已应用';
    }
    scheduleOverlayResize();
  }

  function setEncounterState(state, syncForm = false) {
    if (state?.config === undefined)
      return;
    const previousZoneId = encounterState.zoneId;
    encounterState = {
      ...encounterState,
      ...state,
      config: { ...safeEncounterConfig, ...state.config },
      draftConfig: {
        ...safeEncounterConfig,
        ...(state.draftConfig ?? state.config ?? encounterState.draftConfig),
      },
      profiles: Array.isArray(state.profiles) ? state.profiles : encounterState.profiles,
      safeDefaults: { ...safeEncounterConfig, ...(state.safeDefaults ?? {}) },
    };
    renderProfileOptions();
    if (syncForm || !configFormInitialized || previousZoneId !== encounterState.zoneId)
      writeConfigToForm(encounterState.draftConfig);
    renderConfigState();
  }

  async function callStringConfig(action, payload = {}) {
    const result = await window.callOverlayHandler({ call: 'stringConfig', action, ...payload });
    if (result?.ok !== true)
      throw new Error(result?.error ?? 'StringDownloader 未返回配置状态');
    configBackendAvailable = true;
    setEncounterState(result.state);
    configError.textContent = result.state?.warning ?? '';
    return result;
  }

  async function requestConfigState() {
    try {
      const result = await callStringConfig('get');
      setEncounterState(result.state, true);
    } catch (error) {
      configBackendAvailable = false;
      configError.textContent = error?.message ?? String(error);
      if (!configFormInitialized)
        writeConfigToForm(safeEncounterConfig);
      renderConfigState();
    }
  }

  async function handleZoneChanged(event) {
    const detail = event?.detail ?? event ?? {};
    const zoneId = Number(detail.zoneID ?? detail.zoneId ?? 0);
    if (!Number.isInteger(zoneId) || zoneId < 0)
      return;
    try {
      await flushDraftSave();
      const result = await callStringConfig('enterZone', {
        zoneId,
        zoneName: detail.zoneName ?? '',
      });
      setEncounterState(result.state, true);
    } catch (error) {
      configBackendAvailable = false;
      configError.textContent = error?.message ?? String(error);
      setEncounterState({
        zoneId,
        zoneName: detail.zoneName ?? '',
        inEncounter: zoneId === dancingMadUltimateZoneId,
        confirmed: false,
        locked: false,
        revision: encounterState.revision + 1,
        config: safeEncounterConfig,
      }, true);
    }
    if (zoneId === dancingMadUltimateZoneId)
      setView('config');
  }

  function handleStringConfigChanged(event) {
    const previousZoneId = encounterState.zoneId;
    setEncounterState(event?.state);
    if (encounterState.zoneId === dancingMadUltimateZoneId && previousZoneId !== encounterState.zoneId)
      setView('config');
  }

  async function handleCombatChanged(event) {
    const detail = event?.detail ?? event ?? {};
    const inCombat = Boolean(detail.inGameCombat ?? detail.inACTCombat ?? false);
    try {
      if (inCombat)
        await flushDraftSave();
      const result = await callStringConfig('setCombat', { inCombat });
      setEncounterState(result.state);
    } catch (error) {
      configError.textContent = error?.message ?? String(error);
    }
  }

  async function disableCombatOption(control) {
    const key = control.dataset.configKey;
    if (!encounterState.locked || !combatDisableKeys.has(key) ||
      control.type !== 'checkbox' || control.checked || !isCombatDisableEnabled(key)) {
      renderConfigState();
      return;
    }

    control.disabled = true;
    configError.textContent = '';
    try {
      const result = await callStringConfig('disableCombatOption', { key });
      setEncounterState(result.state, true);
    } catch (error) {
      control.checked = isCombatDisableEnabled(key);
      configError.textContent = error?.message ?? String(error);
      renderConfigState();
    }
  }

  function scheduleDraftSave() {
    configDirty = true;
    configError.textContent = '';
    clearTimeout(configSaveTimer);
    configSaveTimer = window.setTimeout(() => persistDraftConfig(), 180);
    renderConfigState();
  }

  async function persistDraftConfig() {
    clearTimeout(configSaveTimer);
    configSaveTimer = undefined;
    if (!configDirty || !configBackendAvailable || encounterState.locked)
      return;

    const config = readConfigFromForm();
    const snapshot = JSON.stringify(config);
    const save = async () => {
      try {
        const result = await callStringConfig('update', { config });
        const unchanged = JSON.stringify(readConfigFromForm()) === snapshot;
        if (unchanged)
          configDirty = false;
        setEncounterState(result.state, unchanged);
        if (!unchanged)
          scheduleDraftSave();
      } catch (error) {
        configDirty = true;
        configError.textContent = error?.message ?? String(error);
        renderConfigState();
      }
    };
    const pending = configSavePromise.then(save, save);
    configSavePromise = pending.catch(() => {});
    return pending;
  }

  async function flushDraftSave() {
    clearTimeout(configSaveTimer);
    configSaveTimer = undefined;
    if (configDirty)
      await persistDraftConfig();
    await configSavePromise;
  }

  async function selectConfigProfile() {
    const profileId = configProfileSelect.value;
    try {
      await flushDraftSave();
      const result = await callStringConfig('selectProfile', { profileId });
      setEncounterState(result.state, true);
      configError.textContent = '';
    } catch (error) {
      configError.textContent = error?.message ?? String(error);
      renderConfigState();
    }
  }

  async function saveCurrentProfile() {
    const name = profileNameInput.value.trim();
    if (name === '')
      return;
    try {
      await flushDraftSave();
      const result = await callStringConfig('saveProfile', {
        name,
        config: readConfigFromForm(),
      });
      profileNameInput.value = '';
      setEncounterState(result.state, true);
      configError.textContent = '';
    } catch (error) {
      configError.textContent = error?.message ?? String(error);
      renderConfigState();
    }
  }

  async function restoreDefaults() {
    try {
      await flushDraftSave();
      const result = await callStringConfig('reset');
      setEncounterState(result.state, true);
      configError.textContent = '';
    } catch (error) {
      configError.textContent = error?.message ?? String(error);
      renderConfigState();
    }
  }

  async function applyEncounterConfig() {
    if (!encounterState.inEncounter || encounterState.locked ||
      (!configDirty && !encounterState.hasPendingChanges))
      return;
    applyConfigButton.disabled = true;
    configError.textContent = '';
    try {
      await flushDraftSave();
      const result = await callStringConfig('apply', { config: readConfigFromForm() });
      setEncounterState(result.state, true);
    } catch (error) {
      configError.textContent = error?.message ?? String(error);
      renderConfigState();
    }
  }

  function setupOverlay() {
    defaultSortButton.addEventListener('click', defaultSort);
    rolesTab.addEventListener('click', () => setView('roles'));
    configTab.addEventListener('click', () => setView('config'));
    configProfileSelect.addEventListener('change', selectConfigProfile);
    profileNameInput.addEventListener('input', renderConfigState);
    profileNameInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter')
        return;
      event.preventDefault();
      saveCurrentProfile();
    });
    saveProfileButton.addEventListener('click', saveCurrentProfile);
    restoreDefaultsButton.addEventListener('click', restoreDefaults);
    applyConfigButton.addEventListener('click', applyEncounterConfig);
    p2EightTowerPreset?.addEventListener('change', applyP2EightTowerPreset);
    for (const tab of phaseTabs)
      tab.addEventListener('click', () => setActivePhase(tab.dataset.phase));
    for (const control of configControls) {
      control.addEventListener('change', () => {
        if (encounterState.locked) {
          void disableCombatOption(control);
          return;
        }
        syncP2EightTowerPreset();
        scheduleDraftSave();
      });
    }
    for (const select of document.querySelectorAll('select'))
      bindSelectInteraction(select);
    appShell.addEventListener('pointerenter', () => {
      pointerInside = true;
      clearTimeout(compactTimer);
      setCompactMode(false);
    });
    appShell.addEventListener('pointerleave', () => {
      pointerInside = false;
      scheduleCompactMode();
    });

    window.stringRuntimeDebug = {
      setParty,
      buildPayload,
      swapRoleSlots,
      defaultSort,
      enterZone: (zoneId = dancingMadUltimateZoneId, zoneName = '妖星乱舞绝境战') =>
        handleZoneChanged({ zoneID: zoneId, zoneName }),
      setCombat: (inCombat) => handleCombatChanged({ detail: { inGameCombat: inCombat } }),
      setPhase: setActivePhase,
      getEncounterState: () => ({
        ...encounterState,
        config: { ...encounterState.config },
        draftConfig: { ...encounterState.draftConfig },
        profiles: encounterState.profiles.map((profile) => ({ ...profile })),
      }),
    };

    writeConfigToForm(safeEncounterConfig);
    renderProfileOptions();
    setActivePhase(activePhase);
    renderConfigState();
    render();
    installDemoOverlayApi();
    installOverlayApi();
    pointerInside = appShell.matches(':hover');
    compactMode = !pointerInside;
    renderActiveView(true);
    connectionState.textContent = '连接中';
    connectionState.className = 'state state-pending';
    window.addOverlayListener('PartyChanged', (event) => setParty(event.party));
    window.addOverlayListener('ChangePrimaryPlayer', handlePrimaryPlayer);
    window.addOverlayListener('BroadcastMessage', handleBroadcastMessage);
    window.addOverlayListener('StringConfigChanged', handleStringConfigChanged);
    window.addOverlayListener('ChangeZone', handleZoneChanged);
    window.addOverlayListener('onInCombatChangedEvent', handleCombatChanged);
    onOverlayReady(() => {
      connectionState.textContent = '已连接';
      connectionState.className = 'state state-live';
      render();
      window.callOverlayHandler({
        call: 'broadcast',
        source: 'stringRuntimeJS',
        msg: { text: 'ready' },
      });
      requestPartySnapshot();
      requestConfigState();
      window.setInterval(() => {
        if (party.length === 0)
          requestPartySnapshot();
      }, 3000);
    });
    window.setTimeout(() => {
      if (overlayConnected)
        return;
      connectionState.textContent = '离线';
      connectionState.className = 'state state-idle';
      render();
    }, 1800);
    if (typeof window.startOverlayEvents === 'function')
      window.startOverlayEvents();
    if (demoMode) {
      window.setTimeout(() => demoDispatchOverlayEvent?.({
        type: 'ChangeZone',
        zoneID: dancingMadUltimateZoneId,
        zoneName: '妖星乱舞绝境战',
      }), 120);
    }
  }

  setupOverlay();
})();

(() => {
  'use strict';

  const roles = ['MT', 'ST', 'H1', 'H2', 'D1', 'D2', 'D3', 'D4'];
  const groupStarts = new Set(['MT', 'H1', 'D1']);
  const roleGroups = {
    tank: ['MT', 'ST'],
    healer: ['H1', 'H2'],
    dps: ['D1', 'D2', 'D3', 'D4'],
  };
  const demoMode = new URLSearchParams(window.location.search).get('demo') === '1';
  const storageKey = demoMode ? 'string-runtime-role-map-demo-v1' : 'string-runtime-role-map-v1';
  const configStorageKey = demoMode
    ? 'string-runtime-encounter-config-demo-v1'
    : 'string-runtime-encounter-config-v1';
  const dancingMadUltimateZoneId = 1363;
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
    MyDMU_P5SymphonySpreadScheme: 'regular',
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
  const priorityConfigKeys = new Set([
    'MyDMU_P3TargetFirstPriority',
    'MyDMU_P3TargetSecondPriority',
    'MyDMU_P3TargetThirdPriority',
  ]);
  const completeRoleOrderConfigKeys = new Set([
    'MyDMU_P1BeamOrder',
    'MyDMU_P3FireBuffOrder',
    'MyDMU_P5SymphonyOrder',
  ]);
  const hiddenSelectValues = {
    MyDMU_P4BuffChatChannel: new Set(['e', 'p']),
    MyDMU_P5MitigationChannel: new Set(['e', 'p']),
  };
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
  let localConfigStore = readLocalConfigStore();
  const initialLocalProfile = getLocalActiveProfile(localConfigStore);

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
  const customSelects = new WeakMap();
  let openCustomSelectState;
  let customSelectSequence = 0;
  let resizeScheduleToken = 0;
  let resizeRequestSequence = 0;
  let resizeQueue = Promise.resolve();
  let lastResizeKey = '';
  let pendingResizeKey = '';
  let resizeRetryKey = '';
  let resizeRetryAttempt = 0;
  let resizeRetryTimer;
  let resizeErrorMessage = '';
  let configDirty = false;
  let configSaveTimer;
  let configSavePromise = Promise.resolve();
  let configMutationQueue = Promise.resolve();
  let configFormInitialized = false;
  let configBackendAvailable = false;
  let activeBackendInstanceId = '';
  const retiredBackendInstanceIds = new Set();
  let latestBackendRevision = -1;
  let backendConfigProfiles = [];
  let bridgeSyncInProgress = false;
  let configRequestPromise;
  let demoDispatchOverlayEvent;
  let encounterState = {
    zoneId: 0,
    zoneName: '',
    inEncounter: false,
    confirmed: false,
    locked: false,
    revision: 0,
    config: { ...safeEncounterConfig },
    draftConfig: { ...initialLocalProfile.config },
    activeProfileId: initialLocalProfile.id,
    profiles: localConfigStore.profiles.map(({ id, name }) => ({ id, name })),
    safeDefaults: { ...safeEncounterConfig },
    configSchemaVersion: 4,
    features: { partyChatEnabled: true },
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
          MyDMU_P5SymphonySpreadScheme: 'leaning',
        },
      },
    ];
    let activeProfileId = 'static';
    let draftConfig = { ...demoProfiles.find((profile) => profile.id === activeProfileId).config };
    const demoInstanceId = `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    let state = {
      ...encounterState,
      instanceId: demoInstanceId,
      configSchemaVersion: 4,
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
    let webSocketMode = false;
    let webSocketOpened = false;
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
      if (webSocketMode) {
        if (ws?.readyState === WebSocket.OPEN && queue === null)
          ws.send(JSON.stringify(message));
        else {
          queue ??= [];
          queue.push(message);
        }
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
      const socket = new WebSocket(wsUrl);
      ws = socket;
      socket.addEventListener('open', () => {
        if (ws !== socket)
          return;
        const reconnect = webSocketOpened;
        webSocketOpened = true;
        markOverlayReady();
        flushQueue();
        connectionState.textContent = '已连接';
        connectionState.className = 'state state-live';
        if (reconnect) {
          configBackendAvailable = false;
          render();
          renderConfigState();
          void requestConfigState();
        }
      });
      socket.addEventListener('message', (event) => {
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
      socket.addEventListener('close', () => {
        if (ws !== socket)
          return;
        ws = null;
        queue = [];
        for (const [sequence, promise] of Object.entries(responsePromises)) {
          promise.reject(new Error('OverlayPlugin WebSocket 已断开'));
          delete responsePromises[sequence];
        }
        overlayConnected = false;
        configBackendAvailable = false;
        resetBackendRevisionTracking();
        connectionState.textContent = '重连中';
        connectionState.className = 'state state-pending';
        render();
        renderConfigState();
        window.setTimeout(() => connectWebSocket(wsUrl), 1000);
      });
      socket.addEventListener('error', (error) => console.error(error));
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
        webSocketMode = true;
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
      if (webSocketMode) {
        request.rseq = responseSequence++;
        const promise = new Promise((resolve, reject) => {
          const timeout = window.setTimeout(() => {
            delete responsePromises[request.rseq];
            if (queue !== null)
              queue = queue.filter((item) => item?.rseq !== request.rseq);
            reject(new Error('OverlayPlugin WebSocket 请求超时'));
          }, 10000);
          responsePromises[request.rseq] = {
            resolve: (value) => {
              clearTimeout(timeout);
              resolve(value);
            },
            reject: (error) => {
              clearTimeout(timeout);
              reject(error);
            },
          };
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

  function normalizeLocalConfig(input, fallback = safeEncounterConfig) {
    const source = input !== null && typeof input === 'object' && !Array.isArray(input)
      ? input
      : {};
    const canonicalFallback = fallback;
    const normalized = { ...safeEncounterConfig };
    for (const [key, defaultValue] of Object.entries(safeEncounterConfig)) {
      const fallbackValue = canonicalFallback?.[key];
      if (typeof fallbackValue === typeof defaultValue)
        normalized[key] = fallbackValue;
      const value = source[key];
      if (typeof defaultValue === 'boolean' && typeof value === 'boolean')
        normalized[key] = value;
      else if (typeof defaultValue === 'string' && typeof value === 'string' &&
        configControlByKey[key]?.tagName !== 'SELECT') {
        normalized[key] = value.trim();
      }
    }
    for (const control of configControls) {
      const key = control.dataset.configKey;
      const value = source[key];
      if (control.type === 'checkbox') {
        if (typeof value === 'boolean')
          normalized[key] = value;
        continue;
      }
      if (typeof value !== 'string')
        continue;
      const text = value.trim();
      if (control.tagName === 'SELECT') {
        const options = [...control.options].map((option) => option.value);
        if (options.includes(text))
          normalized[key] = text;
        else if (options.includes(String(canonicalFallback?.[key] ?? '')))
          normalized[key] = String(canonicalFallback[key]);
        else
          normalized[key] = safeEncounterConfig[key];
        continue;
      }
      const maximumLength = Number(control.maxLength);
      normalized[key] = maximumLength > 0 ? text.slice(0, maximumLength) : text;
    }
    for (const [key, values] of Object.entries(hiddenSelectValues)) {
      if (!values.has(normalized[key]))
        normalized[key] = values.has(canonicalFallback?.[key])
          ? canonicalFallback[key]
          : safeEncounterConfig[key];
    }
    return normalized;
  }

  function normalizeRoleSequence(value, key, requireAllRoles) {
    const parts = String(value ?? '').trim().toUpperCase()
      .split(/[\s,，/|>＞、;；]+/u)
      .filter((part) => part !== '');
    const unknownRole = parts.find((part) => !roles.includes(part));
    if (unknownRole !== undefined)
      throw new Error(`${key} 包含未知职能：${unknownRole}`);
    const normalized = [...new Set(parts)];
    if (requireAllRoles && (parts.length !== roles.length || normalized.length !== roles.length))
      throw new Error(`${key} 必须且只能包含全部 8 个职能`);
    if (!requireAllRoles && normalized.length === 0)
      throw new Error(`${key} 至少需要一个职能`);
    return normalized.join('/');
  }

  function normalizeLocalConfigForSave(input, fallback = safeEncounterConfig) {
    const normalized = normalizeLocalConfig(input, fallback);
    for (const key of completeRoleOrderConfigKeys)
      normalized[key] = normalizeRoleSequence(input?.[key] ?? normalized[key], key, true);
    for (const key of priorityConfigKeys)
      normalized[key] = normalizeRoleSequence(input?.[key] ?? normalized[key], key, false);
    return normalized;
  }

  function normalizeLocalProfileName(value) {
    const name = typeof value === 'string' ? value.trim() : '';
    if (name === '')
      throw new Error('请输入配置名称');
    if (name.length > 32 || [...name].some((character) => /[\u0000-\u001F\u007F]/u.test(character)))
      throw new Error('配置名称无效');
    return name;
  }

  function createDefaultLocalConfigStore() {
    return {
      version: 2,
      revision: 0,
      activeProfileId: 'default',
      pendingBridgeSync: false,
      profiles: [{ id: 'default', name: '默认配置', config: { ...safeEncounterConfig } }],
    };
  }

  function readLocalConfigStore() {
    const saved = readJson(configStorageKey, undefined);
    if (saved === undefined || saved === null || typeof saved !== 'object' || Array.isArray(saved))
      return createDefaultLocalConfigStore();

    const profiles = [];
    const ids = new Set();
    const names = new Set();
    let migrated = saved.version !== 2;
    for (const item of Array.isArray(saved.profiles) ? saved.profiles.slice(0, 20) : []) {
      const id = typeof item?.id === 'string' ? item.id.trim() : '';
      let name;
      try {
        name = normalizeLocalProfileName(item?.name);
      } catch {
        continue;
      }
      const normalizedName = name.toLocaleLowerCase('zh-CN');
      if (!/^[A-Za-z0-9_.:-]{1,80}$/u.test(id) || ids.has(id) || names.has(normalizedName))
        continue;
      ids.add(id);
      names.add(normalizedName);
      const persistedConfig = item?.config !== null && typeof item?.config === 'object' &&
        !Array.isArray(item.config)
        ? { ...item.config }
        : item?.config;
      const legacySpreadScheme = persistedConfig?.MyDMU_P5SymphonySpreadScheme;
      if (legacySpreadScheme === 'eden')
        persistedConfig.MyDMU_P5SymphonySpreadScheme = 'regular';
      else if (legacySpreadScheme === 'omega')
        persistedConfig.MyDMU_P5SymphonySpreadScheme = 'leaning';
      migrated ||= legacySpreadScheme === 'eden' || legacySpreadScheme === 'omega';
      profiles.push({
        id,
        name,
        config: normalizeLocalConfig(persistedConfig),
      });
    }
    if (profiles.length === 0)
      return createDefaultLocalConfigStore();

    const activeProfileId = profiles.some((profile) => profile.id === saved.activeProfileId)
      ? saved.activeProfileId
      : profiles[0].id;
    const store = {
      version: 2,
      revision: Number.isSafeInteger(saved.revision) && saved.revision >= 0 ? saved.revision : 0,
      activeProfileId,
      pendingBridgeSync: saved.pendingBridgeSync === true || migrated,
      profiles,
    };
    if (migrated) {
      try {
        writeJson(configStorageKey, store);
      } catch (error) {
        console.warn('String 本地配置旧值迁移写回失败', error);
      }
    }
    return store;
  }

  function getLocalActiveProfile(store = localConfigStore) {
    return store.profiles.find((profile) => profile.id === store.activeProfileId) ?? store.profiles[0];
  }

  function persistLocalConfigStore() {
    writeJson(configStorageKey, localConfigStore);
  }

  function touchLocalConfig() {
    localConfigStore.revision = Number.isSafeInteger(localConfigStore.revision)
      ? localConfigStore.revision + 1
      : 1;
  }

  function saveLocalActiveConfig(config, pendingBridgeSync = true) {
    const profile = getLocalActiveProfile();
    profile.config = normalizeLocalConfigForSave(config, profile.config);
    localConfigStore.pendingBridgeSync ||= pendingBridgeSync;
    touchLocalConfig();
    persistLocalConfigStore();
    encounterState.draftConfig = { ...profile.config };
    encounterState.hasPendingChanges = encounterState.inEncounter &&
      JSON.stringify(encounterState.config) !== JSON.stringify(profile.config);
    return profile.config;
  }

  function selectLocalConfigProfile(profileId) {
    const profile = localConfigStore.profiles.find((item) => item.id === profileId);
    if (profile === undefined)
      throw new Error('本地配置档案不存在');
    localConfigStore.activeProfileId = profile.id;
    localConfigStore.pendingBridgeSync = true;
    touchLocalConfig();
    persistLocalConfigStore();
    updateEncounterFromLocal(true);
  }

  function saveLocalConfigProfile(name, config) {
    const normalizedName = normalizeLocalProfileName(name);
    const sourceConfig = { ...getLocalActiveProfile().config, ...config };
    let profile = localConfigStore.profiles.find((item) =>
      item.name.localeCompare(normalizedName, 'zh-CN', { sensitivity: 'accent' }) === 0);
    if (profile === undefined) {
      if (localConfigStore.profiles.length >= 20)
        throw new Error('配置档案最多保存 20 个');
      profile = {
        id: `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
        name: normalizedName,
        config: { ...safeEncounterConfig },
      };
      localConfigStore.profiles.push(profile);
    }
    profile.name = normalizedName;
    profile.config = normalizeLocalConfigForSave(sourceConfig, getLocalActiveProfile().config);
    localConfigStore.activeProfileId = profile.id;
    localConfigStore.pendingBridgeSync = true;
    touchLocalConfig();
    persistLocalConfigStore();
    updateEncounterFromLocal(true);
  }

  function resetLocalConfigProfile() {
    const profile = getLocalActiveProfile();
    profile.config = { ...safeEncounterConfig };
    localConfigStore.pendingBridgeSync = true;
    touchLocalConfig();
    persistLocalConfigStore();
    updateEncounterFromLocal(true);
  }

  function updateEncounterFromLocal(syncForm = false) {
    const profile = getLocalActiveProfile();
    const profiles = configBackendAvailable ? [...backendConfigProfiles] : [];
    for (const localProfile of localConfigStore.profiles) {
      const existingIndex = profiles.findIndex((item) => item.id === localProfile.id);
      const metadata = { id: localProfile.id, name: localProfile.name };
      if (existingIndex === -1)
        profiles.push(metadata);
      else
        profiles[existingIndex] = metadata;
    }
    encounterState = {
      ...encounterState,
      draftConfig: { ...profile.config },
      activeProfileId: profile.id,
      profiles,
      features: { ...encounterState.features, partyChatEnabled: true },
      hasPendingChanges: encounterState.inEncounter &&
        JSON.stringify(encounterState.config) !== JSON.stringify(profile.config),
    };
    renderProfileOptions();
    if (syncForm)
      writeConfigToForm(profile.config);
    renderConfigState();
  }

  function rememberBackendStateLocally(state) {
    const activeProfileId = typeof state?.activeProfileId === 'string'
      ? state.activeProfileId
      : 'default';
    const profileMeta = Array.isArray(state?.profiles)
      ? state.profiles.find((profile) => profile.id === activeProfileId)
      : undefined;
    const name = typeof profileMeta?.name === 'string' && profileMeta.name.trim() !== ''
      ? profileMeta.name.trim()
      : '默认配置';
    const config = normalizeLocalConfig(state?.draftConfig ?? state?.config);
    localConfigStore.profiles = localConfigStore.profiles.filter((profile) =>
      profile.id !== activeProfileId &&
      profile.name.localeCompare(name, 'zh-CN', { sensitivity: 'accent' }) !== 0);
    localConfigStore.profiles.push({ id: activeProfileId, name, config });
    localConfigStore.activeProfileId = activeProfileId;
    localConfigStore.pendingBridgeSync = false;
    touchLocalConfig();
    persistLocalConfigStore();
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
    if (openCustomSelectState !== undefined &&
        openCustomSelectState.state.root.closest('#roleSlots') !== null)
      closeCustomSelect(openCustomSelectState.select);
    for (const select of roleSlots.querySelectorAll('select'))
      customSelects.get(select)?.observer.disconnect();
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
      bindSelectInteraction(select);
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
    openCustomSelect(select);
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
    const nextPlayerName = cleanName(event?.charName ?? event?.name);
    if (nextPlayerName !== '' && nextPlayerName !== currentPlayerName)
      setView('roles');
    currentPlayerName = nextPlayerName;
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

  function resetOverlayResizeRetry() {
    clearTimeout(resizeRetryTimer);
    resizeRetryTimer = undefined;
    resizeRetryKey = '';
    resizeRetryAttempt = 0;
  }

  function scheduleOverlayResizeRetry(resizeKey, requestSequence) {
    if (requestSequence !== resizeRequestSequence)
      return;
    if (resizeRetryKey !== resizeKey) {
      resetOverlayResizeRetry();
      resizeRetryKey = resizeKey;
    }
    const retryDelays = [250, 500, 1000];
    if (resizeRetryAttempt >= retryDelays.length)
      return;
    const delay = retryDelays[resizeRetryAttempt++];
    clearTimeout(resizeRetryTimer);
    resizeRetryTimer = window.setTimeout(() => {
      resizeRetryTimer = undefined;
      if (requestSequence === resizeRequestSequence)
        scheduleOverlayResize(true);
    }, delay);
  }

  function updateDisconnectedResizeFallback() {
    document.documentElement.classList.remove('resize-fallback');
    if (currentLayoutMode() !== 'config')
      return;
    const natural = measureOverlayLayout();
    const clipped = natural.width > document.documentElement.clientWidth ||
      natural.height > document.documentElement.clientHeight;
    document.documentElement.classList.toggle('resize-fallback', clipped);
  }

  async function requestOverlayLayout(mode, requested, requestSequence, resizeKey) {
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
    const currentRequest = requestSequence === resizeRequestSequence;
    if (result?.ok !== true) {
      failureMessage ||= result?.error ?? 'StringDownloader 未返回窗口尺寸';
      if (currentRequest)
        lastResizeKey = '';
      console.warn('String Runtime overlay resize failed:', failureMessage);
      if (mode === 'config') {
        resizeErrorMessage = `窗口自动调整失败：${failureMessage}`;
        configError.textContent = resizeErrorMessage;
      }
    } else {
      if (currentRequest) {
        lastResizeKey = resizeKey;
        resetOverlayResizeRetry();
      }
      if (mode === 'config' && resizeErrorMessage !== '') {
        if (configError.textContent === resizeErrorMessage)
          configError.textContent = '';
        resizeErrorMessage = '';
      }
    }
    if (currentRequest && pendingResizeKey === resizeKey)
      pendingResizeKey = '';
    updateResizeFallback(mode, requested, result, requestSequence);
    if (result?.ok !== true && currentRequest)
      scheduleOverlayResizeRetry(resizeKey, requestSequence);
  }

  function scheduleOverlayResize(resetFallback = false) {
    const canRequestResize = overlayConnected && typeof window.callOverlayHandler === 'function';
    if (!canRequestResize) {
      updateDisconnectedResizeFallback();
      resetOverlayResizeRetry();
      return;
    }
    if (!resetFallback && document.documentElement.classList.contains('resize-fallback'))
      return;
    if (resetFallback)
      document.documentElement.classList.remove('resize-fallback');
    const scheduleToken = ++resizeScheduleToken;
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      if (scheduleToken !== resizeScheduleToken)
        return;
      if (!overlayConnected || typeof window.callOverlayHandler !== 'function') {
        updateDisconnectedResizeFallback();
        resetOverlayResizeRetry();
        return;
      }
      const mode = currentLayoutMode();
      const requested = measureOverlayLayout();
      const resizeKey = `${mode}:${requested.width}x${requested.height}`;
      if (resizeRetryKey !== '' && resizeRetryKey !== resizeKey)
        resetOverlayResizeRetry();
      if (!resetFallback && (resizeKey === lastResizeKey || resizeKey === pendingResizeKey))
        return;
      clearTimeout(resizeRetryTimer);
      resizeRetryTimer = undefined;
      pendingResizeKey = resizeKey;
      const requestSequence = ++resizeRequestSequence;
      const resize = () => requestOverlayLayout(mode, requested, requestSequence, resizeKey);
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
    if (pointerInside || pointerDragState !== undefined)
      return;
    compactTimer = window.setTimeout(() => {
      if (pointerInside || pointerDragState !== undefined)
        return;
      if (selectInteraction !== undefined)
        closeCustomSelect(selectInteraction);
      if (!pointerInside && pointerDragState === undefined && selectInteraction === undefined)
        setCompactMode(true);
    }, 180);
  }

  function endSelectInteraction(select) {
    if (selectInteraction !== select)
      return;
    selectInteraction = undefined;
    clearTimeout(selectInteractionTimer);
  }

  function beginSelectInteraction(select) {
    selectInteraction = select;
    clearTimeout(compactTimer);
    clearTimeout(selectInteractionTimer);
    selectInteractionTimer = window.setTimeout(() => closeCustomSelect(select), 30000);
  }

  function selectedOptionFor(select) {
    return [...select.options].find((option) => option.value === select.value) ??
      [...select.options].find((option) => !option.disabled) ?? select.options[0];
  }

  function renderCustomSelectOptions(select) {
    const state = customSelects.get(select);
    if (state === undefined)
      return;
    const selectedValue = select.value;
    state.options.replaceChildren(...[...select.options].map((option) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'string-combobox-option';
      item.dataset.value = option.value;
      item.textContent = option.textContent ?? option.value;
      item.disabled = select.disabled || option.disabled;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', option.value === selectedValue ? 'true' : 'false');
      item.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (select.disabled || item.disabled)
          return;
        const changed = select.value !== option.value;
        select.value = option.value;
        closeCustomSelect(select);
        syncCustomSelect(select);
        if (changed)
          select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      return item;
    }));
  }

  function syncCustomSelect(select) {
    const state = customSelects.get(select);
    if (state === undefined)
      return;
    const selected = selectedOptionFor(select);
    state.value.textContent = selected?.textContent?.trim() || '请选择';
    state.trigger.disabled = select.disabled;
    state.root.dataset.disabled = select.disabled ? 'true' : 'false';
    if (select.disabled && state.root.dataset.open === 'true') {
      closeCustomSelect(select);
      return;
    }
    if (state.root.dataset.open === 'true') {
      renderCustomSelectOptions(select);
      scheduleOverlayResize(true);
    }
  }

  function syncCustomSelects(selects = document.querySelectorAll('select')) {
    for (const select of selects)
      syncCustomSelect(select);
  }

  function closeCustomSelect(select = openCustomSelectState?.select, restoreFocus = false) {
    if (!(select instanceof HTMLSelectElement))
      return;
    const state = customSelects.get(select);
    if (state === undefined || state.root.dataset.open !== 'true') {
      endSelectInteraction(select);
      return;
    }
    state.root.dataset.open = 'false';
    state.trigger.setAttribute('aria-expanded', 'false');
    state.options.hidden = true;
    if (openCustomSelectState?.select === select)
      openCustomSelectState = undefined;
    endSelectInteraction(select);
    if (restoreFocus && !state.trigger.disabled)
      state.trigger.focus({ preventScroll: true });
    scheduleOverlayResize(true);
    scheduleCompactMode();
  }

  function openCustomSelect(select) {
    if (!(select instanceof HTMLSelectElement) || select.disabled)
      return;
    let state = customSelects.get(select);
    if (state === undefined) {
      enhanceCustomSelect(select);
      state = customSelects.get(select);
    }
    if (state === undefined)
      return;
    if (openCustomSelectState?.select !== select)
      closeCustomSelect(openCustomSelectState?.select);
    renderCustomSelectOptions(select);
    state.root.dataset.open = 'true';
    state.trigger.setAttribute('aria-expanded', 'true');
    state.options.hidden = false;
    openCustomSelectState = { select, state };
    beginSelectInteraction(select);
    scheduleOverlayResize(true);
  }

  function enhanceCustomSelect(select) {
    if (!(select instanceof HTMLSelectElement))
      return;
    if (customSelects.has(select)) {
      syncCustomSelect(select);
      return;
    }
    if (select.parentElement === null)
      return;

    const root = document.createElement('div');
    root.className = 'string-combobox';
    if (select.classList.contains('member-select'))
      root.classList.add('member-combobox');
    root.dataset.open = 'false';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'string-combobox-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    const label = select.getAttribute('aria-label');
    if (label !== null)
      trigger.setAttribute('aria-label', label);

    const value = document.createElement('span');
    value.className = 'string-combobox-value';
    const caret = document.createElement('span');
    caret.className = 'string-combobox-caret';
    caret.setAttribute('aria-hidden', 'true');
    trigger.append(value, caret);

    const options = document.createElement('div');
    options.id = `string-combobox-options-${++customSelectSequence}`;
    options.className = 'string-combobox-options';
    options.setAttribute('role', 'listbox');
    options.hidden = true;
    trigger.setAttribute('aria-controls', options.id);
    root.append(trigger, options);

    select.classList.add('native-select-model');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
    select.insertAdjacentElement('afterend', root);

    const state = { root, trigger, value, options };
    customSelects.set(select, state);
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (root.dataset.open === 'true')
        closeCustomSelect(select);
      else
        openCustomSelect(select);
    });
    const implicitLabel = select.closest('label');
    implicitLabel?.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.target === select ||
        (event.target instanceof Node && root.contains(event.target)))
        return;
      event.preventDefault();
      openCustomSelect(select);
    });
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeCustomSelect(select);
        return;
      }
      if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowDown')
        return;
      event.preventDefault();
      openCustomSelect(select);
    });
    select.addEventListener('change', () => syncCustomSelect(select));
    const observer = new MutationObserver(() => syncCustomSelect(select));
    observer.observe(select, {
      attributes: true,
      attributeFilter: ['disabled'],
      childList: true,
      subtree: true,
    });
    state.observer = observer;
    syncCustomSelect(select);
  }

  function bindSelectInteraction(select) {
    enhanceCustomSelect(select);
  }

  function setView(view) {
    closeCustomSelect();
    activeView = view === 'config' ? 'config' : 'roles';
    renderActiveView(true);
  }

  function setActivePhase(phase) {
    closeCustomSelect();
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
    syncCustomSelects([...configControls, p2EightTowerPreset, configProfileSelect].filter(Boolean));
    configFormInitialized = true;
    configDirty = false;
  }

  function readConfigFromForm() {
    return Object.fromEntries(configControls.map((control) => [
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
    if (p2EightTowerPreset !== null) {
      p2EightTowerPreset.value = p2EightTowerPresetFor(values);
      syncCustomSelect(p2EightTowerPreset);
    }
  }

  function applyP3TowerPresetAxes() {
    const strategy = configControlByKey.MyDMU_P3TowerStrategy?.value;
    const mapping = {
      nocchh: ['heel', 'arena'],
      daohuo: ['heel', 'boss'],
    }[strategy];
    if (mapping === undefined)
      return;
    const heading = configControlByKey.MyDMU_P3TowerHeading;
    const frame = configControlByKey.MyDMU_P3TowerFrame;
    heading.value = mapping[0];
    frame.value = mapping[1];
    syncCustomSelect(heading);
    syncCustomSelect(frame);
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
    syncCustomSelect(configControlByKey.MyDMU_P2Pair2222IdleOddMode);
    syncCustomSelect(configControlByKey.MyDMU_P2OddStrategy);
    syncP2EightTowerPreset();
    scheduleDraftSave();
  }

  function getVisibleConfigProfiles() {
    const profiles = configBackendAvailable ? [...backendConfigProfiles] : [];
    for (const localProfile of localConfigStore.profiles) {
      const existingIndex = profiles.findIndex((profile) => profile.id === localProfile.id);
      const metadata = { id: localProfile.id, name: localProfile.name };
      if (existingIndex === -1)
        profiles.push(metadata);
      else
        profiles[existingIndex] = metadata;
    }
    return profiles;
  }

  function getActiveProfile() {
    return getVisibleConfigProfiles().find((profile) => profile.id === encounterState.activeProfileId) ??
      getLocalActiveProfile();
  }

  function renderProfileOptions() {
    const selectedId = encounterState.activeProfileId;
    configProfileSelect.replaceChildren(...getVisibleConfigProfiles().map((profile) => {
      const option = document.createElement('option');
      option.value = profile.id;
      option.textContent = profile.name;
      option.selected = profile.id === selectedId;
      return option;
    }));
    syncCustomSelect(configProfileSelect);
  }

  function isCombatDisableEnabled(key) {
    return encounterState.config?.[key] === true || encounterState.draftConfig?.[key] === true;
  }

  function renderConfigState() {
    const editable = !encounterState.locked;
    const activeProfile = getActiveProfile();
    const hasPendingBridgeSync = configDirty || localConfigStore.pendingBridgeSync;
    const hasPendingChanges = hasPendingBridgeSync || encounterState.hasPendingChanges;
    configPanel.classList.toggle('locked', encounterState.locked);
    for (const control of configControls) {
      const key = control.dataset.configKey;
      const combatDisable = encounterState.locked &&
        control.type === 'checkbox' && combatDisableKeys.has(key);
      const canDisableInCombat = configBackendAvailable && combatDisable &&
        isCombatDisableEnabled(key);
      if (combatDisable)
        control.checked = isCombatDisableEnabled(key);
      control.disabled = !editable && !canDisableInCombat;
      control.title = control.disabled && encounterState.locked
        ? '战斗中仅可关闭已开启的标点或小队消息'
        : '';
    }
    if (p2EightTowerPreset !== null)
      p2EightTowerPreset.disabled = !editable;
    configProfileSelect.disabled = !editable;
    profileNameInput.disabled = !editable;
    saveProfileButton.disabled = !editable || profileNameInput.value.trim() === '';
    restoreDefaultsButton.disabled = !editable;
    applyConfigButton.disabled = !editable;
    syncCustomSelects([...configControls, p2EightTowerPreset, configProfileSelect].filter(Boolean));
    applyConfigButton.textContent = configBackendAvailable && encounterState.inEncounter
      ? '保存并生效'
      : '保存设置';
    applyConfigButton.title = '';
    profileMemoryState.textContent = encounterState.locked
      ? '战斗中仅可关闭标点与小队消息'
        : configDirty
          ? '正在保存修改…'
          : hasPendingBridgeSync
            ? '已保存，等待同步到 ACT'
            : configBackendAvailable ? '修改会自动保存' : '保存在此浏览器';
    activeProfileStatus.textContent = activeProfile === undefined
      ? '尚无配置档案'
      : `当前：${activeProfile.name}`;

    configTabDot.className = 'tab-dot';
    if (encounterState.inEncounter)
      configTabDot.classList.add(hasPendingChanges ? 'pending' : 'applied');

    if (encounterState.locked) {
      configStateBadge.textContent = configBackendAvailable ? '战斗中' : '桥接中断';
      configStateBadge.className = 'config-state state-locked';
      configHint.textContent = configBackendAvailable
        ? '战斗中仅可关闭已开启的自动标点或小队消息；关闭后立即阻止后续发送。'
        : '桥接暂不可用；页面仍显示最后收到的实际开关状态，但目前无法下发关闭操作。';
      dirtyState.textContent = hasPendingBridgeSync
        ? '修改已保存在悬浮窗，脱战并恢复桥接后同步'
        : '方案已锁定；桥接恢复后可关闭标点与小队消息';
    } else if (!configBackendAvailable) {
      configStateBadge.textContent = '本地模式';
      configStateBadge.className = 'config-state state-waiting';
      configHint.textContent = overlayConnected
        ? `可直接修改“${activeProfile?.name ?? '默认配置'}”；桥接恢复后由这个悬浮窗同步到 ACT。`
        : `可直接修改“${activeProfile?.name ?? '默认配置'}”；当前仅保存在此浏览器，不影响 ACT。`;
      dirtyState.textContent = configDirty
        ? '正在保存到此浏览器…'
        : overlayConnected ? '已保存到悬浮窗，尚未下发 ACT' : '已保存到此浏览器，尚未下发 ACT';
    } else if (hasPendingBridgeSync) {
      configStateBadge.textContent = '待同步';
      configStateBadge.className = 'config-state state-waiting';
      configHint.textContent = `“${activeProfile?.name ?? '默认配置'}”已保存，正在同步到 ACT。`;
      dirtyState.textContent = encounterState.inEncounter
        ? '尚未应用到本次战斗'
        : '尚未写入 ACT 配置档案';
    } else if (!encounterState.inEncounter) {
      configStateBadge.textContent = '已保存';
      configStateBadge.className = 'config-state state-applied';
      configHint.textContent = `“${activeProfile?.name ?? '默认配置'}”可随时修改，进入绝妖星时自动生效。`;
      dirtyState.textContent = configDirty ? '正在保存到配置档案…' : '设置已保存；进本自动生效';
    } else if (hasPendingChanges) {
      configStateBadge.textContent = '正在保存';
      configStateBadge.className = 'config-state state-waiting';
      configHint.textContent = `当前使用“${activeProfile?.name ?? '默认配置'}”；修改会自动保存并生效。`;
      dirtyState.textContent = '正在保存并应用修改…';
    } else {
      configStateBadge.textContent = '已生效';
      configStateBadge.className = 'config-state state-applied';
      configHint.textContent = `当前使用“${activeProfile?.name ?? '默认配置'}”；修改会自动保存并生效。`;
      dirtyState.textContent = '当前设置已保存并生效';
    }
    scheduleOverlayResize();
  }

  function getBackendInstanceId(state) {
    return typeof state?.instanceId === 'string' ? state.instanceId.trim() : '';
  }

  function resetBackendRevisionTracking() {
    activeBackendInstanceId = '';
    retiredBackendInstanceIds.clear();
    latestBackendRevision = -1;
    backendConfigProfiles = [];
  }

  function isStaleBackendState(state) {
    const instanceId = getBackendInstanceId(state);
    if (instanceId !== '' && retiredBackendInstanceIds.has(instanceId))
      return true;
    if (instanceId === '' && activeBackendInstanceId !== '')
      return true;
    if (instanceId !== '' && activeBackendInstanceId !== '' && instanceId !== activeBackendInstanceId)
      return false;
    const revision = Number(state?.revision);
    if (!Number.isSafeInteger(revision) || revision < 0)
      return false;
    return revision < latestBackendRevision;
  }

  function acceptBackendRevision(state) {
    if (isStaleBackendState(state))
      return false;
    const instanceId = getBackendInstanceId(state);
    if (instanceId !== '' && instanceId !== activeBackendInstanceId) {
      if (activeBackendInstanceId !== '')
        retiredBackendInstanceIds.add(activeBackendInstanceId);
      activeBackendInstanceId = instanceId;
      latestBackendRevision = -1;
      backendConfigProfiles = [];
      setView('roles');
    }
    const revision = Number(state?.revision);
    if (!Number.isSafeInteger(revision) || revision < 0)
      return true;
    latestBackendRevision = revision;
    return true;
  }

  function rememberBackendProfileMetadata(state) {
    if (!Array.isArray(state?.profiles))
      return;
    backendConfigProfiles = state.profiles
      .filter((profile) => typeof profile?.id === 'string' && typeof profile?.name === 'string')
      .map((profile) => ({ id: profile.id, name: profile.name }));
  }

  function setEncounterState(state, syncForm = false) {
    if (state?.config === undefined || !acceptBackendRevision(state))
      return false;
    rememberBackendProfileMetadata(state);
    const config = { ...safeEncounterConfig, ...state.config };
    const draftConfig = {
      ...safeEncounterConfig,
      ...(state.draftConfig ?? state.config ?? encounterState.draftConfig),
    };
    const safeDefaults = {
      ...safeEncounterConfig,
      ...(state.safeDefaults ?? {}),
    };
    encounterState = {
      ...encounterState,
      ...state,
      config,
      draftConfig,
      profiles: Array.isArray(state.profiles) ? state.profiles : encounterState.profiles,
      safeDefaults,
    };
    renderProfileOptions();
    if (syncForm || !configFormInitialized)
      writeConfigToForm(encounterState.draftConfig);
    renderConfigState();
    return true;
  }

  function mergeBackendLifecycleState(state) {
    if (state?.config === undefined || !acceptBackendRevision(state))
      return false;
    rememberBackendProfileMetadata(state);
    const profile = getLocalActiveProfile();
    const config = { ...safeEncounterConfig, ...state.config };
    encounterState = {
      ...encounterState,
      ...state,
      config,
      draftConfig: { ...profile.config },
      activeProfileId: profile.id,
      profiles: Array.isArray(state.profiles) ? state.profiles : encounterState.profiles,
      safeDefaults: {
        ...safeEncounterConfig,
        ...(state.safeDefaults ?? {}),
      },
      hasPendingChanges: state.inEncounter === true &&
        JSON.stringify(config) !== JSON.stringify(profile.config),
    };
    updateEncounterFromLocal(false);
    return true;
  }

  function adoptBackendState(state, syncForm = true) {
    if (state?.config === undefined || !acceptBackendRevision(state))
      return false;
    rememberBackendStateLocally(state);
    setEncounterState(state, false);
    updateEncounterFromLocal(syncForm);
    return true;
  }

  function captureDirtyFormLocally() {
    clearTimeout(configSaveTimer);
    configSaveTimer = undefined;
    if (!configDirty)
      return false;
    saveLocalActiveConfig(readConfigFromForm());
    configDirty = false;
    renderConfigState();
    return true;
  }

  function captureDirtyFormAfterBackendState(state) {
    if (!configDirty)
      return true;
    try {
      captureDirtyFormLocally();
      return true;
    } catch (error) {
      mergeBackendLifecycleState(state);
      configError.textContent = error?.message ?? String(error);
      renderConfigState();
      return false;
    }
  }

  function enqueueConfigMutation(action) {
    const run = async () => {
      bridgeSyncInProgress = true;
      renderConfigState();
      try {
        return await action();
      } finally {
        bridgeSyncInProgress = false;
        renderConfigState();
      }
    };
    const pending = configMutationQueue.then(run, run);
    configMutationQueue = pending.catch(() => {});
    return pending;
  }

  async function callStringConfig(action, payload = {}) {
    const result = await window.callOverlayHandler({ call: 'stringConfig', action, ...payload });
    if (result?.ok !== true)
      throw new Error(result?.error ?? 'StringDownloader 未返回配置状态');
    configBackendAvailable = true;
    configError.textContent = result.state?.warning ?? '';
    return result;
  }

  function getLocalSyncSnapshot() {
    const profile = getLocalActiveProfile();
    return {
      revision: localConfigStore.revision,
      profileId: profile.id,
      profileName: profile.name,
      config: { ...profile.config },
      serializedConfig: JSON.stringify(profile.config),
    };
  }

  function localSyncSnapshotStillCurrent(snapshot) {
    const profile = getLocalActiveProfile();
    return !configDirty &&
      localConfigStore.revision === snapshot.revision &&
      profile.id === snapshot.profileId &&
      profile.name === snapshot.profileName &&
      JSON.stringify(profile.config) === snapshot.serializedConfig;
  }

  async function settleBridgeDraftRaw(result) {
    if (isStaleBackendState(result.state) || result.state?.inEncounter !== true ||
      result.state?.locked === true ||
      result.state?.hasPendingChanges !== true) {
      return result;
    }
    return callStringConfig('apply', { config: result.state.draftConfig });
  }

  async function syncPendingLocalConfigToBridgeRaw() {
    if (!localConfigStore.pendingBridgeSync || encounterState.locked)
      return undefined;

    let result;
    for (let attempt = 0; attempt < 3 && localConfigStore.pendingBridgeSync; ++attempt) {
      if (encounterState.locked)
        break;
      if (configDirty)
        captureDirtyFormLocally();
      const snapshot = getLocalSyncSnapshot();
      result = await callStringConfig('saveProfile', {
        name: snapshot.profileName,
        config: snapshot.config,
      });
      try {
        result = await settleBridgeDraftRaw(result);
      } catch (error) {
        mergeBackendLifecycleState(result.state);
        throw error;
      }
      if (!captureDirtyFormAfterBackendState(result.state))
        return;
      if (localSyncSnapshotStillCurrent(snapshot)) {
        if (adoptBackendState(result.state, true)) {
          configError.textContent = '';
          return result;
        }
      }
      mergeBackendLifecycleState(result.state);
    }

    if (localConfigStore.pendingBridgeSync && !encounterState.locked) {
      window.setTimeout(() => {
        void syncPendingLocalConfigToBridge().catch((error) => {
          configError.textContent = `设置已保存在悬浮窗；同步到 ACT 失败：${error?.message ?? String(error)}`;
          renderConfigState();
        });
      });
    }
    return result;
  }

  async function resolveBridgeResultRaw(result, syncForm = true) {
    try {
      if (configDirty)
        captureDirtyFormLocally();
    } catch (error) {
      mergeBackendLifecycleState(result.state);
      configError.textContent = error?.message ?? String(error);
      renderConfigState();
      return result;
    }
    if (localConfigStore.pendingBridgeSync) {
      mergeBackendLifecycleState(result.state);
      if (!encounterState.locked)
        return await syncPendingLocalConfigToBridgeRaw() ?? result;
      return result;
    }
    adoptBackendState(result.state, syncForm);
    return result;
  }

  function syncPendingLocalConfigToBridge() {
    if (!localConfigStore.pendingBridgeSync)
      return Promise.resolve(undefined);
    return enqueueConfigMutation(syncPendingLocalConfigToBridgeRaw);
  }

  function requestConfigState() {
    if (configRequestPromise !== undefined)
      return configRequestPromise;
    const request = requestConfigStateOnce();
    configRequestPromise = request.finally(() => {
      configRequestPromise = undefined;
    });
    return configRequestPromise;
  }

  async function requestConfigStateOnce() {
    try {
      if (configDirty)
        captureDirtyFormLocally();
    } catch (error) {
      configError.textContent = error?.message ?? String(error);
      renderConfigState();
      return;
    }

    return enqueueConfigMutation(async () => {
      let result;
      try {
        result = await callStringConfig('get');
      } catch (error) {
        configBackendAvailable = false;
        resetBackendRevisionTracking();
        configError.textContent = '';
        updateEncounterFromLocal(false);
        return;
      }

      if (!captureDirtyFormAfterBackendState(result.state))
        return;

      if (localConfigStore.pendingBridgeSync) {
        mergeBackendLifecycleState(result.state);
        if (result.state?.locked !== true) {
          try {
            await syncPendingLocalConfigToBridgeRaw();
          } catch (error) {
            configError.textContent = `设置已保存在悬浮窗；同步到 ACT 失败：${error?.message ?? String(error)}`;
            renderConfigState();
          }
        }
        return;
      }

      try {
        result = await settleBridgeDraftRaw(result);
        await resolveBridgeResultRaw(result, true);
      } catch (error) {
        setEncounterState(result.state, false);
        configError.textContent = `ACT 中存在尚未应用的设置：${error?.message ?? String(error)}`;
        renderConfigState();
      }
    });
  }

  async function handleZoneChanged(event) {
    const detail = event?.detail ?? event ?? {};
    const zoneId = Number(detail.zoneID ?? detail.zoneId ?? 0);
    if (!Number.isInteger(zoneId) || zoneId < 0)
      return;
    try {
      await flushDraftSave();
    } catch (error) {
      configError.textContent = `设置已保存在悬浮窗：${error?.message ?? String(error)}`;
    }

    let bridgeState;
    try {
      await enqueueConfigMutation(async () => {
        let result = await callStringConfig('enterZone', {
          zoneId,
          zoneName: detail.zoneName ?? '',
        });
        bridgeState = result.state;
        if (!captureDirtyFormAfterBackendState(result.state))
          return;
        if (localConfigStore.pendingBridgeSync) {
          mergeBackendLifecycleState(result.state);
          result = await syncPendingLocalConfigToBridgeRaw() ?? result;
          bridgeState = result.state;
          return;
        }
        result = await settleBridgeDraftRaw(result);
        bridgeState = result.state;
        await resolveBridgeResultRaw(result, true);
      });
    } catch (error) {
      if (bridgeState !== undefined) {
        mergeBackendLifecycleState(bridgeState);
        configError.textContent = `设置已保存在悬浮窗；同步到 ACT 失败：${error?.message ?? String(error)}`;
      } else {
        configBackendAvailable = false;
        resetBackendRevisionTracking();
        configError.textContent = `设置仍保存在此悬浮窗：${error?.message ?? String(error)}`;
        encounterState = {
          ...encounterState,
          zoneId,
          zoneName: detail.zoneName ?? '',
          inEncounter: zoneId === dancingMadUltimateZoneId,
          confirmed: false,
          locked: false,
          revision: encounterState.revision + 1,
        };
        updateEncounterFromLocal(false);
      }
      renderConfigState();
    }
  }

  function handleStringConfigChanged(event) {
    if (isStaleBackendState(event?.state))
      return;
    configBackendAvailable = true;
    try {
      if (configDirty)
        captureDirtyFormLocally();
    } catch (error) {
      configError.textContent = error?.message ?? String(error);
    }
    if (configDirty || localConfigStore.pendingBridgeSync) {
      mergeBackendLifecycleState(event?.state);
      if (!configDirty && localConfigStore.pendingBridgeSync &&
        event?.state?.locked !== true && !bridgeSyncInProgress) {
        void syncPendingLocalConfigToBridge().catch((error) => {
          configError.textContent = `设置已保存在悬浮窗；同步到 ACT 失败：${error?.message ?? String(error)}`;
          updateEncounterFromLocal(false);
        });
      }
      return;
    }
    adoptBackendState(event?.state, true);
  }

  async function handleCombatChanged(event) {
    const detail = event?.detail ?? event ?? {};
    const inCombat = Boolean(detail.inGameCombat ?? detail.inACTCombat ?? false);
    try {
      await enqueueConfigMutation(async () => {
        let result = await callStringConfig('setCombat', { inCombat });
        if (!captureDirtyFormAfterBackendState(result.state))
          return;
        if (localConfigStore.pendingBridgeSync) {
          mergeBackendLifecycleState(result.state);
          if (!inCombat)
            result = await syncPendingLocalConfigToBridgeRaw() ?? result;
          return;
        }
        if (!inCombat)
          result = await settleBridgeDraftRaw(result);
        await resolveBridgeResultRaw(result, !configDirty);
      });
    } catch (error) {
      configError.textContent = localConfigStore.pendingBridgeSync
        ? `设置已保存在悬浮窗；同步到 ACT 失败：${error?.message ?? String(error)}`
        : error?.message ?? String(error);
      renderConfigState();
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
      const hadPendingLocalChanges = localConfigStore.pendingBridgeSync || configDirty;
      const result = await callStringConfig('disableCombatOption', { key });
      const preserveLocalChanges = hadPendingLocalChanges ||
        localConfigStore.pendingBridgeSync || configDirty;
      if (!preserveLocalChanges) {
        adoptBackendState(result.state, true);
        renderConfigState();
        return;
      }
      const profile = getLocalActiveProfile();
      profile.config = normalizeLocalConfig({ ...profile.config, [key]: false }, profile.config);
      localConfigStore.pendingBridgeSync = true;
      touchLocalConfig();
      persistLocalConfigStore();
      mergeBackendLifecycleState(result.state);
      renderConfigState();
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
    if (!configDirty)
      return;

    const config = readConfigFromForm();
    const snapshot = JSON.stringify(config);
    const save = async () => {
      let unchanged;
      try {
        saveLocalActiveConfig(config);
        unchanged = JSON.stringify(readConfigFromForm()) === snapshot;
        configDirty = !unchanged;
      } catch (error) {
        configDirty = true;
        configError.textContent = error?.message ?? String(error);
        renderConfigState();
        return;
      }

      if (!configBackendAvailable || encounterState.locked) {
        configError.textContent = '';
        renderConfigState();
        if (!unchanged)
          scheduleDraftSave();
        return;
      }

      try {
        await syncPendingLocalConfigToBridge();
        unchanged = JSON.stringify(readConfigFromForm()) === snapshot;
        configDirty = !unchanged;
        if (!unchanged)
          scheduleDraftSave();
      } catch (error) {
        configDirty = !unchanged;
        configError.textContent = `设置已保存在悬浮窗；同步到 ACT 失败：${error?.message ?? String(error)}`;
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
      if (!configBackendAvailable) {
        selectLocalConfigProfile(profileId);
        configError.textContent = '';
        return;
      }
      await enqueueConfigMutation(async () => {
        if (!backendConfigProfiles.some((profile) => profile.id === profileId)) {
          selectLocalConfigProfile(profileId);
          await syncPendingLocalConfigToBridgeRaw();
          return;
        }
        let result = await callStringConfig('selectProfile', { profileId });
        result = await settleBridgeDraftRaw(result);
        await resolveBridgeResultRaw(result, true);
      });
      configError.textContent = '';
    } catch (error) {
      configError.textContent = localConfigStore.pendingBridgeSync
        ? `设置已保存在悬浮窗；同步到 ACT 失败：${error?.message ?? String(error)}`
        : error?.message ?? String(error);
      renderConfigState();
    }
  }

  async function saveCurrentProfile() {
    const name = profileNameInput.value.trim();
    if (name === '')
      return;
    try {
      await flushDraftSave();
      saveLocalConfigProfile(name, readConfigFromForm());
      profileNameInput.value = '';
      if (configBackendAvailable)
        await syncPendingLocalConfigToBridge();
      configError.textContent = '';
    } catch (error) {
      configError.textContent = `设置已保存在悬浮窗；同步到 ACT 失败：${error?.message ?? String(error)}`;
      renderConfigState();
    }
  }

  async function restoreDefaults() {
    try {
      await flushDraftSave();
      resetLocalConfigProfile();
      if (!configBackendAvailable) {
        configError.textContent = '';
        return;
      }
      await syncPendingLocalConfigToBridge();
      configError.textContent = '';
    } catch (error) {
      configError.textContent = `设置已保存在悬浮窗；同步到 ACT 失败：${error?.message ?? String(error)}`;
      renderConfigState();
    }
  }

  async function applyEncounterConfig() {
    if (encounterState.locked)
      return;
    applyConfigButton.disabled = true;
    configError.textContent = '';
    try {
      await flushDraftSave();
      const config = saveLocalActiveConfig(readConfigFromForm());
      if (!configBackendAvailable) {
        localConfigStore.pendingBridgeSync = true;
        persistLocalConfigStore();
        configDirty = false;
        renderConfigState();
        return;
      }
      await syncPendingLocalConfigToBridge();
      configDirty = false;
    } catch (error) {
      configError.textContent = `设置已保存在悬浮窗；同步到 ACT 失败：${error?.message ?? String(error)}`;
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
      if (control instanceof HTMLInputElement && control.type === 'text') {
        control.addEventListener('input', () => {
          if (!encounterState.locked)
            scheduleDraftSave();
        });
      }
      control.addEventListener('change', () => {
        if (encounterState.locked) {
          void disableCombatOption(control);
          return;
        }
        if (control.dataset.configKey === 'MyDMU_P3TowerStrategy')
          applyP3TowerPresetAxes();
        syncP2EightTowerPreset();
        scheduleDraftSave();
      });
    }
    window.addEventListener('beforeunload', () => {
      try {
        if (configDirty)
          captureDirtyFormLocally();
      } catch (error) {
        console.error(error);
      }
    });
    for (const select of document.querySelectorAll('select'))
      bindSelectInteraction(select);
    document.addEventListener('pointerdown', (event) => {
      const activeSelect = selectInteraction;
      if (activeSelect === undefined)
        return;
      const activeState = customSelects.get(activeSelect);
      if (event.target instanceof Node && activeState?.root.contains(event.target))
        return;
      closeCustomSelect(activeSelect);
    }, true);
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
      requestConfigState,
      setPhase: setActivePhase,
      getEncounterState: () => ({
        ...encounterState,
        config: { ...encounterState.config },
        draftConfig: { ...encounterState.draftConfig },
        profiles: encounterState.profiles.map((profile) => ({ ...profile })),
      }),
      getLocalConfigState: () => JSON.parse(JSON.stringify(localConfigStore)),
    };

    writeConfigToForm(initialLocalProfile.config);
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
        if ((!configBackendAvailable || localConfigStore.pendingBridgeSync ||
          encounterState.hasPendingChanges) && !bridgeSyncInProgress) {
          requestConfigState();
        }
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

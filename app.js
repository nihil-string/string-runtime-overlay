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
    ? 'string-runtime-encounter-config-demo-v2'
    : 'string-runtime-encounter-config-v1';
  const dancingMadUltimateZoneId = 1363;
  const defaultProfileId = 'default';
  const defaultProfileName = '默认配置';
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
    MyDMU_P2UseBbyPos: false,
    MyDMU_P2EndTowerStrategy: 'north',
    MyDMU_P2TrineDrawMode: 'preview',
    MyDMU_P2TowerCallout: false,
    MyDMU_P2ActionCallout: true,
    MyDMU_P3MahjongMarkV3: false,
    MyDMU_P3TargetMarkV3: false,
    MyDMU_P3FireBuffOrder: 'MT/ST/H1/H2/D1/D2/D3/D4',
    MyDMU_P3SuperJumpBait: 'D3',
    MyDMU_P3KnockbackStrategy: 'thht',
    MyDMU_P3SlapRoleSectors: false,
    MyDMU_P3SlapRouteArrow: false,
    MyDMU_P3Attack1DoubleTether: false,
    MyDMU_P3Stop2DoubleTether: false,
    MyDMU_P3TowerStrategy: 'nocchh',
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
    MyDMU_P5GroundFireGuideEnabled: false,
    MyDMU_P5ForsakenGuideEnabled: false,
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
  const priorityGroupRoles = {
    T: ['MT', 'ST'],
    H: ['H1', 'H2'],
    D: ['D1', 'D2', 'D3', 'D4'],
  };
  const priorityGroupOrder = ['T', 'D', 'H'];
  const priorityGroupLabels = {
    T: 'T',
    D: 'D',
    H: 'N',
  };
  const priorityRoleGroups = Object.fromEntries(Object.entries(priorityGroupRoles)
    .flatMap(([group, groupRoles]) => groupRoles.map((role) => [role, group])));
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
  const profileMemoryState = document.getElementById('profileMemoryState');
  const dirtyState = document.getElementById('dirtyState');
  const configError = document.getElementById('configError');
  const applyConfigButton = document.getElementById('applyConfigButton');
  const configControls = [...document.querySelectorAll('[data-config-key]')];
  const configControlByKey = Object.fromEntries(configControls.map((control) =>
    [control.dataset.configKey, control]));
  const p2EightTowerPreset = document.getElementById('p2EightTowerPreset');
  const phaseTabs = [...document.querySelectorAll('[data-phase]')];
  const phasePanels = [...document.querySelectorAll('[data-phase-panel]')];
  const priorityEditors = [...document.querySelectorAll('[data-priority-editor]')];
  const prioritySets = [...document.querySelectorAll('[data-priority-set]')];
  const roleOrderEditors = [...document.querySelectorAll('[data-role-order-editor]')];
  const priorityEditorStates = new WeakMap();
  const roleOrderEditorStates = new WeakMap();
  let priorityDragState;
  let localConfigStore = readLocalConfigStore();
  const initialLocalProfile = getLocalActiveProfile(localConfigStore);

  let party = [];
  let roleByName = readJson(storageKey, {});
  let pendingBroadcastTimer;
  let pointerDragState;
  let currentPlayerName = '';
  let arrReplayPartyActive = false;
  let overlayConnected = false;
  let activeView = 'roles';
  let activePhase = 'p1';
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
    configSchemaVersion: 6,
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
      {
        id: defaultProfileId,
        name: defaultProfileName,
        config: normalizeLocalConfigForSave(initialLocalProfile.config),
      },
    ];
    let activeProfileId = defaultProfileId;
    let draftConfig = { ...demoProfiles[0].config };
    const demoInstanceId = `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    let state = {
      ...encounterState,
      instanceId: demoInstanceId,
      configSchemaVersion: 6,
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
        if (request.profileId !== defaultProfileId)
          return { ok: false, error: '配置档案不存在' };
        activeProfileId = defaultProfileId;
        draftConfig = { ...demoProfiles[0].config };
        updateDemoState({ revision: state.revision + 1 });
        dispatch({ type: 'StringConfigChanged', state });
      } else if (request.action === 'saveProfile') {
        if (request.name?.trim() !== defaultProfileName)
          return { ok: false, error: '只允许保存默认配置' };
        draftConfig = { ...safeEncounterConfig, ...request.config };
        demoProfiles[0].config = { ...draftConfig };
        activeProfileId = defaultProfileId;
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

  function parseCompleteRoleOrder(value) {
    const parsed = String(value ?? '').trim().toUpperCase()
      .split(/[\s,，/|>＞、;；]+/u)
      .filter((part) => roles.includes(part));
    const order = [];
    const seen = new Set();
    for (const role of [...parsed, ...roles]) {
      if (seen.has(role))
        continue;
      seen.add(role);
      order.push(role);
    }
    return order;
  }

  function moveOrderItem(order, fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 ||
      fromIndex >= order.length || toIndex >= order.length) {
      return false;
    }
    const [item] = order.splice(fromIndex, 1);
    order.splice(toIndex, 0, item);
    return true;
  }

  function createOrderSeparator() {
    const separator = document.createElement('span');
    separator.className = 'order-separator';
    separator.textContent = '›';
    separator.setAttribute('aria-hidden', 'true');
    return separator;
  }

  function createOrderChip(value, index, attribute, className = '', label = value) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `order-chip ${className}`.trim();
    button.dataset[attribute] = value;
    button.textContent = label;
    button.draggable = !encounterState.locked;
    button.disabled = encounterState.locked;
    button.title = '拖动调整顺序；也可以用左右方向键移动';
    button.setAttribute('aria-label', `${label}，当前第 ${index + 1} 位`);
    return button;
  }

  function parsePriorityEditorState(value, previousState) {
    const completeOrder = parseCompleteRoleOrder(value);
    const groups = [];
    const seenGroups = new Set();
    const roleOrders = Object.fromEntries(Object.keys(priorityGroupRoles)
      .map((group) => [group, []]));
    for (const role of completeOrder) {
      const group = priorityRoleGroups[role];
      if (!seenGroups.has(group)) {
        seenGroups.add(group);
        groups.push(group);
      }
      roleOrders[group].push(role);
    }
    for (const group of priorityGroupOrder) {
      if (!seenGroups.has(group))
        groups.push(group);
      for (const role of priorityGroupRoles[group]) {
        if (!roleOrders[group].includes(role))
          roleOrders[group].push(role);
      }
    }
    return {
      groups,
      roleOrders,
      selectedGroup: groups.includes(previousState?.selectedGroup)
        ? previousState.selectedGroup
        : undefined,
    };
  }

  function serializePriorityEditorState(state) {
    return state.groups.flatMap((group) => state.roleOrders[group]).join('/');
  }

  function renderGroupTrack(track, state, attribute) {
    const children = [];
    for (const [index, group] of state.groups.entries()) {
      const chip = createOrderChip(
        group,
        index,
        attribute,
        `group-${group.toLowerCase()}`,
        priorityGroupLabels[group],
      );
      chip.classList.toggle('selected', state.selectedGroup === group);
      chip.setAttribute('aria-expanded', String(state.selectedGroup === group));
      children.push(chip);
      if (index < state.groups.length - 1)
        children.push(createOrderSeparator());
    }
    track.replaceChildren(...children);
  }

  function renderRoleDetail(detail, state, roleAttribute) {
    detail.hidden = state.selectedGroup === undefined;
    if (state.selectedGroup === undefined) {
      detail.replaceChildren();
      return;
    }
    const label = document.createElement('span');
    label.className = 'priority-detail-label';
    label.textContent = `${priorityGroupLabels[state.selectedGroup]} 组内`;
    const roleTrack = document.createElement('div');
    roleTrack.className = 'priority-role-track';
    const roleChildren = [];
    for (const [index, role] of state.roleOrders[state.selectedGroup].entries()) {
      roleChildren.push(createOrderChip(
        role,
        index,
        roleAttribute,
        `role-${state.selectedGroup.toLowerCase()}`,
      ));
      if (index < state.roleOrders[state.selectedGroup].length - 1)
        roleChildren.push(createOrderSeparator());
    }
    roleTrack.replaceChildren(...roleChildren);
    detail.replaceChildren(label, roleTrack);
  }

  function renderRoleOrderEditor(editor, value) {
    const input = editor.querySelector('[data-config-key]');
    const previousState = roleOrderEditorStates.get(editor);
    const state = value === undefined && previousState !== undefined
      ? previousState
      : parsePriorityEditorState(value ?? input.value, previousState);
    roleOrderEditorStates.set(editor, state);
    input.value = serializePriorityEditorState(state);
    renderGroupTrack(editor.querySelector('.role-order-track'), state, 'orderGroup');
    renderRoleDetail(editor.querySelector('.role-order-detail'), state, 'orderRole');
  }

  function commitRoleOrderEditor(editor, focusSelector) {
    const state = roleOrderEditorStates.get(editor);
    const input = editor.querySelector('[data-config-key]');
    input.value = serializePriorityEditorState(state);
    renderRoleOrderEditor(editor);
    input.dispatchEvent(new Event('change', { bubbles: true }));
    if (focusSelector !== undefined)
      editor.querySelector(focusSelector)?.focus();
  }

  function setupRoleOrderEditor(editor) {
    editor.addEventListener('click', (event) => {
      const groupChip = event.target.closest?.('[data-order-group]') ?? null;
      if (groupChip === null || groupChip.disabled)
        return;
      const state = roleOrderEditorStates.get(editor);
      const group = groupChip.dataset.orderGroup;
      state.selectedGroup = state.selectedGroup === group ? undefined : group;
      renderRoleOrderEditor(editor);
      if (state.selectedGroup !== undefined)
        editor.querySelector(`[data-order-group="${group}"]`)?.focus();
    });
    editor.addEventListener('dragstart', (event) => {
      const groupChip = event.target.closest?.('[data-order-group]') ?? null;
      const roleChip = event.target.closest?.('[data-order-role]') ?? null;
      const chip = roleChip ?? groupChip;
      if (chip === null || chip.disabled)
        return;
      priorityDragState = roleChip !== null
        ? {
            editor,
            kind: 'role-order-role',
            value: roleChip.dataset.orderRole,
            group: priorityRoleGroups[roleChip.dataset.orderRole],
          }
        : {
            editor,
            kind: 'role-order-group',
            value: groupChip.dataset.orderGroup,
          };
      chip.classList.add('dragging');
      event.dataTransfer?.setData('text/plain', priorityDragState.value);
      if (event.dataTransfer !== null)
        event.dataTransfer.effectAllowed = 'move';
    });
    editor.addEventListener('dragover', (event) => {
      if (priorityDragState?.editor !== editor)
        return;
      const groupTarget = event.target.closest?.('[data-order-group]') ?? null;
      const roleTarget = event.target.closest?.('[data-order-role]') ?? null;
      const validGroupTarget = priorityDragState.kind === 'role-order-group' &&
        groupTarget !== null;
      const validRoleTarget = priorityDragState.kind === 'role-order-role' &&
        roleTarget !== null &&
        priorityRoleGroups[roleTarget.dataset.orderRole] === priorityDragState.group;
      if (validGroupTarget || validRoleTarget)
        event.preventDefault();
    });
    editor.addEventListener('drop', (event) => {
      if (priorityDragState?.editor !== editor)
        return;
      const state = roleOrderEditorStates.get(editor);
      if (priorityDragState.kind === 'role-order-group') {
        const target = event.target.closest?.('[data-order-group]') ?? null;
        if (target === null)
          return;
        event.preventDefault();
        const fromIndex = state.groups.indexOf(priorityDragState.value);
        const toIndex = state.groups.indexOf(target.dataset.orderGroup);
        if (moveOrderItem(state.groups, fromIndex, toIndex)) {
          commitRoleOrderEditor(
            editor,
            `[data-order-group="${priorityDragState.value}"]`,
          );
        }
        return;
      }
      const target = event.target.closest?.('[data-order-role]') ?? null;
      if (target === null ||
        priorityRoleGroups[target.dataset.orderRole] !== priorityDragState.group) {
        return;
      }
      event.preventDefault();
      const roleOrder = state.roleOrders[priorityDragState.group];
      const fromIndex = roleOrder.indexOf(priorityDragState.value);
      const toIndex = roleOrder.indexOf(target.dataset.orderRole);
      if (moveOrderItem(roleOrder, fromIndex, toIndex)) {
        commitRoleOrderEditor(
          editor,
          `[data-order-role="${priorityDragState.value}"]`,
        );
      }
    });
    editor.addEventListener('dragend', () => {
      editor.querySelector('.dragging')?.classList.remove('dragging');
      priorityDragState = undefined;
    });
    editor.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key))
        return;
      const state = roleOrderEditorStates.get(editor);
      const groupChip = event.target.closest?.('[data-order-group]') ?? null;
      const roleChip = event.target.closest?.('[data-order-role]') ?? null;
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      if (groupChip !== null) {
        const fromIndex = state.groups.indexOf(groupChip.dataset.orderGroup);
        if (!moveOrderItem(state.groups, fromIndex, fromIndex + direction))
          return;
        event.preventDefault();
        commitRoleOrderEditor(
          editor,
          `[data-order-group="${groupChip.dataset.orderGroup}"]`,
        );
        return;
      }
      if (roleChip === null)
        return;
      const group = priorityRoleGroups[roleChip.dataset.orderRole];
      const roleOrder = state.roleOrders[group];
      const fromIndex = roleOrder.indexOf(roleChip.dataset.orderRole);
      if (!moveOrderItem(roleOrder, fromIndex, fromIndex + direction))
        return;
      event.preventDefault();
      commitRoleOrderEditor(
        editor,
        `[data-order-role="${roleChip.dataset.orderRole}"]`,
      );
    });
  }

  function renderPriorityEditor(editor, value) {
    const input = editor.querySelector('[data-config-key]');
    const previousState = priorityEditorStates.get(editor);
    const state = value === undefined && previousState !== undefined
      ? previousState
      : parsePriorityEditorState(value ?? input.value, previousState);
    priorityEditorStates.set(editor, state);
    input.value = serializePriorityEditorState(state);
    renderGroupTrack(editor.querySelector('.priority-track'), state, 'priorityGroup');
    renderRoleDetail(editor.querySelector('.priority-detail'), state, 'priorityRole');
  }

  function commitPriorityEditor(editor, focusSelector) {
    const state = priorityEditorStates.get(editor);
    const input = editor.querySelector('[data-config-key]');
    input.value = serializePriorityEditorState(state);
    renderPriorityEditor(editor);
    const prioritySet = editor.closest('[data-priority-set]');
    if (prioritySet !== null)
      renderPrioritySetMaster(prioritySet);
    input.dispatchEvent(new Event('change', { bubbles: true }));
    if (focusSelector !== undefined)
      editor.querySelector(focusSelector)?.focus();
  }

  function setupPriorityEditor(editor) {
    editor.addEventListener('click', (event) => {
      const groupChip = event.target.closest?.('[data-priority-group]') ?? null;
      if (groupChip === null || groupChip.disabled)
        return;
      const state = priorityEditorStates.get(editor);
      const group = groupChip.dataset.priorityGroup;
      state.selectedGroup = state.selectedGroup === group ? undefined : group;
      renderPriorityEditor(editor);
      if (state.selectedGroup !== undefined)
        editor.querySelector(`[data-priority-group="${group}"]`)?.focus();
    });
    editor.addEventListener('dragstart', (event) => {
      const groupChip = event.target.closest?.('[data-priority-group]') ?? null;
      const roleChip = event.target.closest?.('[data-priority-role]') ?? null;
      const chip = roleChip ?? groupChip;
      if (chip === null || chip.disabled)
        return;
      priorityDragState = roleChip !== null
        ? {
            editor,
            kind: 'priority-role',
            value: roleChip.dataset.priorityRole,
            group: priorityRoleGroups[roleChip.dataset.priorityRole],
          }
        : {
            editor,
            kind: 'priority-group',
            value: groupChip.dataset.priorityGroup,
          };
      chip.classList.add('dragging');
      event.dataTransfer?.setData('text/plain', priorityDragState.value);
      if (event.dataTransfer !== null)
        event.dataTransfer.effectAllowed = 'move';
    });
    editor.addEventListener('dragover', (event) => {
      if (priorityDragState?.editor !== editor)
        return;
      const groupTarget = event.target.closest?.('[data-priority-group]') ?? null;
      const roleTarget = event.target.closest?.('[data-priority-role]') ?? null;
      const validGroupTarget = priorityDragState.kind === 'priority-group' && groupTarget !== null;
      const validRoleTarget = priorityDragState.kind === 'priority-role' && roleTarget !== null &&
        priorityRoleGroups[roleTarget.dataset.priorityRole] === priorityDragState.group;
      if (validGroupTarget || validRoleTarget)
        event.preventDefault();
    });
    editor.addEventListener('drop', (event) => {
      if (priorityDragState?.editor !== editor)
        return;
      const state = priorityEditorStates.get(editor);
      if (priorityDragState.kind === 'priority-group') {
        const target = event.target.closest?.('[data-priority-group]') ?? null;
        if (target === null)
          return;
        event.preventDefault();
        const fromIndex = state.groups.indexOf(priorityDragState.value);
        const toIndex = state.groups.indexOf(target.dataset.priorityGroup);
        if (moveOrderItem(state.groups, fromIndex, toIndex))
          commitPriorityEditor(editor, `[data-priority-group="${priorityDragState.value}"]`);
        return;
      }
      const target = event.target.closest?.('[data-priority-role]') ?? null;
      if (target === null || priorityRoleGroups[target.dataset.priorityRole] !== priorityDragState.group)
        return;
      event.preventDefault();
      const roleOrder = state.roleOrders[priorityDragState.group];
      const fromIndex = roleOrder.indexOf(priorityDragState.value);
      const toIndex = roleOrder.indexOf(target.dataset.priorityRole);
      if (moveOrderItem(roleOrder, fromIndex, toIndex))
        commitPriorityEditor(editor, `[data-priority-role="${priorityDragState.value}"]`);
    });
    editor.addEventListener('dragend', () => {
      editor.querySelector('.dragging')?.classList.remove('dragging');
      priorityDragState = undefined;
    });
    editor.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key))
        return;
      const state = priorityEditorStates.get(editor);
      const groupChip = event.target.closest?.('[data-priority-group]') ?? null;
      const roleChip = event.target.closest?.('[data-priority-role]') ?? null;
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      if (groupChip !== null) {
        const fromIndex = state.groups.indexOf(groupChip.dataset.priorityGroup);
        if (!moveOrderItem(state.groups, fromIndex, fromIndex + direction))
          return;
        event.preventDefault();
        commitPriorityEditor(editor, `[data-priority-group="${groupChip.dataset.priorityGroup}"]`);
        return;
      }
      if (roleChip === null)
        return;
      const group = priorityRoleGroups[roleChip.dataset.priorityRole];
      const roleOrder = state.roleOrders[group];
      const fromIndex = roleOrder.indexOf(roleChip.dataset.priorityRole);
      if (!moveOrderItem(roleOrder, fromIndex, fromIndex + direction))
        return;
      event.preventDefault();
      commitPriorityEditor(editor, `[data-priority-role="${roleChip.dataset.priorityRole}"]`);
    });
  }

  function renderPrioritySetMaster(prioritySet) {
    const editors = [...prioritySet.querySelectorAll('[data-priority-editor]')];
    const states = editors.map((editor) => priorityEditorStates.get(editor))
      .filter((state) => state !== undefined);
    if (states.length === 0)
      return;
    const groups = states[0].groups;
    const allSynchronized = states.length === editors.length &&
      states.every((state) => state.groups.join('/') === groups.join('/'));
    const masterState = {
      groups,
      selectedGroup: undefined,
    };
    renderGroupTrack(
      prioritySet.querySelector('.priority-master-track'),
      masterState,
      'priorityMasterGroup',
    );
    const status = prioritySet.querySelector('.priority-master-status');
    status.textContent = allSynchronized ? '同步三个目标' : '已有细分';
    status.classList.toggle('is-detailed', !allSynchronized);
  }

  function commitPrioritySetGroups(prioritySet, groups, focusGroup) {
    const editors = [...prioritySet.querySelectorAll('[data-priority-editor]')];
    let changeInput;
    for (const editor of editors) {
      const state = priorityEditorStates.get(editor);
      if (state === undefined)
        continue;
      state.groups = [...groups];
      const input = editor.querySelector('[data-config-key]');
      input.value = serializePriorityEditorState(state);
      renderPriorityEditor(editor);
      changeInput ??= input;
    }
    renderPrioritySetMaster(prioritySet);
    changeInput?.dispatchEvent(new Event('change', { bubbles: true }));
    if (focusGroup !== undefined) {
      prioritySet
        .querySelector(`[data-priority-master-group="${focusGroup}"]`)
        ?.focus();
    }
  }

  function setupPrioritySet(prioritySet) {
    const details = prioritySet.querySelector('.priority-target-details');
    const toggle = prioritySet.querySelector('.priority-details-toggle');
    toggle.addEventListener('click', () => {
      details.hidden = !details.hidden;
      const expanded = !details.hidden;
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.textContent = expanded ? '收起' : '细分';
      prioritySet.classList.toggle('details-open', expanded);
    });
    prioritySet.addEventListener('dragstart', (event) => {
      const chip = event.target.closest?.('[data-priority-master-group]') ?? null;
      if (chip === null || chip.disabled)
        return;
      priorityDragState = {
        editor: prioritySet,
        kind: 'priority-master-group',
        value: chip.dataset.priorityMasterGroup,
      };
      chip.classList.add('dragging');
      event.dataTransfer?.setData('text/plain', priorityDragState.value);
      if (event.dataTransfer !== null)
        event.dataTransfer.effectAllowed = 'move';
    });
    prioritySet.addEventListener('dragover', (event) => {
      if (priorityDragState?.editor !== prioritySet ||
        priorityDragState.kind !== 'priority-master-group') {
        return;
      }
      const target = event.target.closest?.('[data-priority-master-group]') ?? null;
      if (target !== null)
        event.preventDefault();
    });
    prioritySet.addEventListener('drop', (event) => {
      if (priorityDragState?.editor !== prioritySet ||
        priorityDragState.kind !== 'priority-master-group') {
        return;
      }
      const target = event.target.closest?.('[data-priority-master-group]') ?? null;
      if (target === null)
        return;
      const firstEditor = prioritySet.querySelector('[data-priority-editor]');
      const firstState = priorityEditorStates.get(firstEditor);
      if (firstState === undefined)
        return;
      const groups = [...firstState.groups];
      const fromIndex = groups.indexOf(priorityDragState.value);
      const toIndex = groups.indexOf(target.dataset.priorityMasterGroup);
      if (!moveOrderItem(groups, fromIndex, toIndex))
        return;
      event.preventDefault();
      commitPrioritySetGroups(prioritySet, groups, priorityDragState.value);
    });
    prioritySet.addEventListener('dragend', () => {
      prioritySet.querySelector('.dragging')?.classList.remove('dragging');
      priorityDragState = undefined;
    });
    prioritySet.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key))
        return;
      const chip = event.target.closest?.('[data-priority-master-group]') ?? null;
      if (chip === null)
        return;
      const firstEditor = prioritySet.querySelector('[data-priority-editor]');
      const firstState = priorityEditorStates.get(firstEditor);
      if (firstState === undefined)
        return;
      const groups = [...firstState.groups];
      const fromIndex = groups.indexOf(chip.dataset.priorityMasterGroup);
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      if (!moveOrderItem(groups, fromIndex, fromIndex + direction))
        return;
      event.preventDefault();
      commitPrioritySetGroups(prioritySet, groups, chip.dataset.priorityMasterGroup);
    });
  }

  function syncOrderEditors(values) {
    for (const editor of roleOrderEditors)
      renderRoleOrderEditor(editor, values?.[editor.dataset.roleOrderEditor]);
    for (const editor of priorityEditors)
      renderPriorityEditor(editor, values?.[editor.dataset.priorityEditor]);
    for (const prioritySet of prioritySets)
      renderPrioritySetMaster(prioritySet);
  }

  function setOrderEditorsDisabled(disabled) {
    for (const editor of [...roleOrderEditors, ...priorityEditors, ...prioritySets]) {
      editor.classList.toggle('disabled', disabled);
      for (const button of editor.querySelectorAll('button')) {
        button.disabled = disabled;
        button.draggable = !disabled;
      }
    }
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
      version: 3,
      revision: 0,
      activeProfileId: defaultProfileId,
      pendingBridgeSync: false,
      profiles: [{
        id: defaultProfileId,
        name: defaultProfileName,
        config: { ...safeEncounterConfig },
      }],
    };
  }

  function readLocalConfigStore() {
    const saved = readJson(configStorageKey, undefined);
    if (saved === undefined || saved === null || typeof saved !== 'object' || Array.isArray(saved))
      return createDefaultLocalConfigStore();

    const profiles = [];
    const ids = new Set();
    const names = new Set();
    let migrated = saved.version !== 3;
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

    const previouslyActiveProfile = profiles.find((profile) => profile.id === saved.activeProfileId) ??
      profiles[0];
    let defaultProfile = profiles.find((profile) => profile.id === defaultProfileId);
    if (defaultProfile === undefined) {
      defaultProfile = {
        id: defaultProfileId,
        name: defaultProfileName,
        config: { ...previouslyActiveProfile.config },
      };
      profiles.unshift(defaultProfile);
      migrated = true;
    } else if (defaultProfile.name !== defaultProfileName) {
      defaultProfile.name = defaultProfileName;
      migrated = true;
    }
    const store = {
      version: 3,
      revision: Number.isSafeInteger(saved.revision) && saved.revision >= 0 ? saved.revision : 0,
      activeProfileId: defaultProfileId,
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
    return store.profiles.find((profile) => profile.id === defaultProfileId) ?? store.profiles[0];
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
    if (syncForm)
      writeConfigToForm(profile.config);
    renderConfigState();
  }

  function rememberBackendStateLocally(state) {
    const config = normalizeLocalConfig(state?.draftConfig ?? state?.config);
    let profile = localConfigStore.profiles.find((item) => item.id === defaultProfileId);
    if (profile === undefined) {
      profile = { id: defaultProfileId, name: defaultProfileName, config };
      localConfigStore.profiles.unshift(profile);
    } else {
      profile.name = defaultProfileName;
      profile.config = config;
    }
    localConfigStore.activeProfileId = defaultProfileId;
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
    if (!canSwapRoleSlots(sourceRole, targetRole))
      return false;
    const sourceTop = roleSlots.querySelector(`[data-role="${sourceRole}"]`)?.getBoundingClientRect().top;
    const targetTop = roleSlots.querySelector(`[data-role="${targetRole}"]`)?.getBoundingClientRect().top;
    const sourceMember = getMemberByRole(sourceRole);
    const targetMember = getMemberByRole(targetRole);

    sourceMember.rp = targetRole;
    if (targetMember !== undefined)
      targetMember.rp = sourceRole;

    saveRoles();
    render();
    animateRoleSwap(sourceRole, targetRole, sourceTop, targetTop);
    scheduleBroadcast();
    return true;
  }

  function canSwapRoleSlots(sourceRole, targetRole) {
    if (sourceRole === targetRole)
      return false;
    const sourceMember = getMemberByRole(sourceRole);
    const targetMember = getMemberByRole(targetRole);
    if (sourceMember === undefined || !isRoleCompatible(sourceMember, targetRole))
      return false;
    return targetMember === undefined || isRoleCompatible(targetMember, sourceRole);
  }

  function animateRoleSwap(sourceRole, targetRole, sourceTop, targetTop) {
    if (!Number.isFinite(sourceTop) || !Number.isFinite(targetTop))
      return;
    const animateContents = (role, startY) => {
      const slot = roleSlots.querySelector(`[data-role="${role}"]`);
      for (const element of [slot?.querySelector('.job-icon:not([hidden])'), slot?.querySelector('.member-cell')]) {
        element?.animate([
          { opacity: 0.35, transform: `translateY(${startY}px)` },
          { opacity: 1, transform: 'translateY(0)' },
        ], {
          duration: 180,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        });
      }
    };
    animateContents(sourceRole, targetTop - sourceTop);
    animateContents(targetRole, sourceTop - targetTop);
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
    if (pointerDragState !== undefined)
      clearPointerDrag();
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
      clearPointerDrag();
      pointerDragState = {
        active: false,
        clientX: event.clientX,
        clientY: event.clientY,
        frameToken: 0,
        ghost: undefined,
        pointerId: event.pointerId,
        role,
        slot,
        startX: event.clientX,
        startY: event.clientY,
        targetRole: undefined,
      };
      handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener('pointermove', (event) => {
      if (pointerDragState === undefined || pointerDragState.pointerId !== event.pointerId)
        return;
      const xDistance = event.clientX - pointerDragState.startX;
      const yDistance = event.clientY - pointerDragState.startY;
      if (!pointerDragState.active && Math.hypot(xDistance, yDistance) < 4)
        return;

      event.preventDefault();
      if (!pointerDragState.active)
        startPointerDrag(pointerDragState);
      pointerDragState.clientX = event.clientX;
      pointerDragState.clientY = event.clientY;
      schedulePointerDragFrame(pointerDragState);
      updatePointerDragTarget(pointerDragState, event.clientX, event.clientY);
    });

    handle.addEventListener('pointerup', (event) => {
      if (pointerDragState === undefined || pointerDragState.pointerId !== event.pointerId)
        return;
      const state = pointerDragState;
      if (state.active)
        updatePointerDragTarget(state, event.clientX, event.clientY);
      const targetRole = state.targetRole;
      clearPointerDrag();
      if (!state.active) {
        openMemberSelect(select);
        return;
      }
      event.preventDefault();
      if (targetRole !== undefined)
        swapRoleSlots(state.role, targetRole);
    });

    handle.addEventListener('pointercancel', clearPointerDrag);
    handle.addEventListener('lostpointercapture', (event) => {
      if (pointerDragState?.pointerId === event.pointerId)
        clearPointerDrag();
    });
  }

  function startPointerDrag(state) {
    state.active = true;
    state.slot.classList.add('dragging');
    document.documentElement.classList.add('role-drag-active');
    const ghost = document.createElement('div');
    ghost.className = 'role-drag-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    const sourceIcon = state.slot.querySelector('.job-icon:not([hidden])');
    if (sourceIcon !== null)
      ghost.append(sourceIcon.cloneNode());
    else
      ghost.append(document.createElement('span'));
    const name = document.createElement('span');
    name.textContent = state.slot.querySelector('.member-name')?.textContent ?? '';
    ghost.append(name);
    const slotRect = state.slot.getBoundingClientRect();
    state.ghostWidth = Math.max(112, slotRect.width - 42);
    state.ghostHeight = 28;
    ghost.style.width = `${state.ghostWidth}px`;
    state.ghost = ghost;
    document.body.append(ghost);
    schedulePointerDragFrame(state);
  }

  function schedulePointerDragFrame(state) {
    if (state.frameToken !== 0)
      return;
    state.frameToken = window.requestAnimationFrame(() => {
      state.frameToken = 0;
      if (pointerDragState !== state || state.ghost === undefined)
        return;
      const x = Math.max(4, Math.min(state.clientX + 10, window.innerWidth - state.ghostWidth - 4));
      const y = Math.max(4, Math.min(state.clientY - (state.ghostHeight / 2), window.innerHeight - state.ghostHeight - 4));
      state.ghost.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
    });
  }

  function updatePointerDragTarget(state, clientX, clientY) {
    const hoveredSlot = document.elementFromPoint(clientX, clientY)?.closest('.role-slot');
    const hoveredRole = hoveredSlot?.dataset.role;
    const targetRole = hoveredRole !== undefined && canSwapRoleSlots(state.role, hoveredRole) ?
      hoveredRole :
      undefined;
    if (state.hoveredRole === hoveredRole && state.targetRole === targetRole)
      return;
    state.hoveredRole = hoveredRole;
    state.targetRole = targetRole;
    for (const candidate of roleSlots.querySelectorAll('.role-slot')) {
      const isHovered = candidate.dataset.role === hoveredRole && hoveredRole !== state.role;
      candidate.classList.toggle('drag-over', isHovered && targetRole !== undefined);
      candidate.classList.toggle('drag-invalid', isHovered && targetRole === undefined);
    }
    state.ghost?.classList.toggle('invalid', hoveredRole !== undefined &&
      hoveredRole !== state.role && targetRole === undefined);
  }

  function clearPointerDrag() {
    const state = pointerDragState;
    pointerDragState = undefined;
    if (state?.frameToken)
      window.cancelAnimationFrame(state.frameToken);
    state?.ghost?.remove();
    document.documentElement.classList.remove('role-drag-active');
    for (const slot of roleSlots.querySelectorAll('.role-slot'))
      slot.classList.remove('dragging', 'drag-over', 'drag-invalid');
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

  function normalizeArrReplayParty(rawParty, requireFullParty) {
    if (!Array.isArray(rawParty) || rawParty.length > 8)
      return;
    const members = rawParty
      .map(normalizeMember)
      .filter((member) => member.inParty && member.name !== '' && getJobGroup(member.job) !== undefined);
    if (members.length !== rawParty.length || requireFullParty && members.length !== 8)
      return;
    const ids = members.map((member) => `${member.id}`.trim().toUpperCase().replace(/^0X/u, ''));
    const names = members.map((member) => member.name);
    if (ids.some((id) => !/^1[0-9A-F]{7}$/u.test(id)) ||
        new Set(ids).size !== ids.length || new Set(names).size !== names.length)
      return;
    if (requireFullParty) {
      const groups = members.map((member) => getJobGroup(member.job));
      if (groups.filter((group) => group === 'tank').length !== 2 ||
          groups.filter((group) => group === 'healer').length !== 2 ||
          groups.filter((group) => group === 'dps').length !== 4)
        return;
    }
    return members.map((member, index) => ({ ...member, id: ids[index] }));
  }

  function handleBroadcastMessage(message) {
    const text = message?.msg?.text;
    if ((message?.source === 'stringUserJS' || message?.source === 'soumaUserJS') &&
        text === 'requestData') {
      broadcast();
      return;
    }
    if (message?.source !== 'stringUserJS' || message?.msg?.type !== 'arrReplayParty' ||
        typeof message.msg.active !== 'boolean')
      return;
    const nextParty = normalizeArrReplayParty(message.msg.party, message.msg.active);
    if (nextParty === undefined)
      return;
    arrReplayPartyActive = message.msg.active;
    setParty(nextParty);
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
    return activeView === 'config' ? 'config' : 'roles';
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
    appShell.dataset.view = activeView;
    rolesPanel.hidden = activeView !== 'roles';
    configPanel.hidden = activeView !== 'config';
    rolesTab.classList.toggle('active', activeView === 'roles');
    configTab.classList.toggle('active', activeView === 'config');
    viewTitle.textContent = activeView === 'config' ? '本次设置' : '职能分配';
    scheduleOverlayResize(resetFallback);
  }

  function endSelectInteraction(select) {
    if (selectInteraction !== select)
      return;
    selectInteraction = undefined;
    clearTimeout(selectInteractionTimer);
  }

  function beginSelectInteraction(select) {
    selectInteraction = select;
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
    syncOrderEditors(values);
    syncCustomSelects([...configControls, p2EightTowerPreset].filter(Boolean));
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

  function getActiveProfile() {
    return getLocalActiveProfile();
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
    setOrderEditorsDisabled(!editable);
    applyConfigButton.disabled = !editable;
    syncCustomSelects([...configControls, p2EightTowerPreset].filter(Boolean));
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
    applyConfigButton.addEventListener('click', applyEncounterConfig);
    p2EightTowerPreset?.addEventListener('change', applyP2EightTowerPreset);
    for (const editor of roleOrderEditors)
      setupRoleOrderEditor(editor);
    for (const editor of priorityEditors)
      setupPriorityEditor(editor);
    for (const prioritySet of prioritySets)
      setupPrioritySet(prioritySet);
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
    window.stringRuntimeDebug = {
      setParty,
      buildPayload,
      swapRoleSlots,
      defaultSort,
      setView,
      getActiveView: () => activeView,
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
    setActivePhase(activePhase);
    renderConfigState();
    render();
    installDemoOverlayApi();
    installOverlayApi();
    renderActiveView(true);
    connectionState.textContent = '连接中';
    connectionState.className = 'state state-pending';
    window.addOverlayListener('PartyChanged', (event) => {
      if (!arrReplayPartyActive)
        setParty(event.party);
    });
    window.addOverlayListener('ChangePrimaryPlayer', handlePrimaryPlayer);
    window.addOverlayListener('BroadcastMessage', handleBroadcastMessage);
    window.addOverlayListener('StringConfigChanged', handleStringConfigChanged);
    window.addOverlayListener('ChangeZone', handleZoneChanged);
    window.addOverlayListener('onInCombatChangedEvent', handleCombatChanged);
    onOverlayReady(() => {
      connectionState.textContent = '已连接';
      connectionState.className = 'state state-live';
      render();
      scheduleOverlayResize(true);
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

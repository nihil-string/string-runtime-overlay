(() => {
  'use strict';

  const roles = ['MT', 'ST', 'H1', 'H2', 'D1', 'D2', 'D3', 'D4'];
  const groupStarts = new Set(['MT', 'H1', 'D1']);
  const storageKey = 'string-runtime-role-map-v1';
  const autoBroadcastKey = 'string-runtime-auto-broadcast-v1';

  const tankJobs = [1, 3, 19, 21, 32, 37];
  const healerJobs = [6, 24, 28, 33, 40];
  const dpsJobs = [2, 4, 5, 7, 20, 22, 23, 25, 26, 27, 29, 30, 31, 34, 35, 36, 38, 39, 41, 42];
  const defaultJobSort = [21, 32, 37, 19, 33, 24, 40, 28, 41, 34, 30, 39, 22, 20, 38, 23, 31, 42, 25, 27, 35, 36];
  const jobNames = {
    1: '剑术', 2: '格斗', 3: '斧术', 4: '枪术', 5: '弓术', 6: '幻术', 7: '咒术',
    19: '骑士', 20: '武僧', 21: '战士', 22: '龙骑', 23: '诗人', 24: '白魔',
    25: '黑魔', 27: '召唤', 28: '学者', 30: '忍者', 31: '机工', 32: '暗骑',
    33: '占星', 34: '武士', 35: '赤魔', 36: '青魔', 37: '绝枪', 38: '舞者',
    39: '钐镰', 40: '贤者', 41: '蝰蛇', 42: '绘灵',
  };

  const roleSlots = document.getElementById('roleSlots');
  const slotTemplate = document.getElementById('roleSlotTemplate');
  const defaultSortButton = document.getElementById('defaultSortButton');
  const broadcastButton = document.getElementById('broadcastButton');
  const autoBroadcastInput = document.getElementById('autoBroadcastInput');
  const statusText = document.getElementById('statusText');
  const lastBroadcastText = document.getElementById('lastBroadcastText');
  const partySummary = document.getElementById('partySummary');
  const connectionState = document.getElementById('connectionState');

  let party = [];
  let roleByName = readJson(storageKey, {});
  let pendingBroadcastTimer;
  let pointerDragState;
  let currentPlayerName = '';

  const hasOverlayApi = () =>
    typeof window.addOverlayListener === 'function' &&
    typeof window.callOverlayHandler === 'function';

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

  function normalizeMember(member) {
    return {
      id: member.id,
      name: member.name ?? member.Name ?? 'Unknown',
      job: Number(member.job ?? member.Job ?? 0),
      inParty: member.inParty ?? member.InParty ?? true,
      rp: undefined,
    };
  }

  function sortScore(member) {
    const index = defaultJobSort.indexOf(Number(member.job));
    return index < 0 ? 999 : index;
  }

  function assignDefaultRoles(members) {
    const sorted = [...members].sort((left, right) => sortScore(left) - sortScore(right));
    const counters = { tank: 0, healer: 0, dps: 0 };
    const tankRoles = ['MT', 'ST'];
    const healerRoles = ['H1', 'H2'];
    const dpsRoles = ['D1', 'D2', 'D3', 'D4'];

    for (const member of sorted) {
      if (tankJobs.includes(member.job))
        member.rp = tankRoles[counters.tank++] ?? undefined;
      else if (healerJobs.includes(member.job))
        member.rp = healerRoles[counters.healer++] ?? undefined;
      else if (dpsJobs.includes(member.job))
        member.rp = dpsRoles[counters.dps++] ?? undefined;
    }

    const used = new Set(sorted.map((member) => member.rp).filter(Boolean));
    for (const member of sorted) {
      if (member.rp !== undefined)
        continue;
      member.rp = roles.find((role) => !used.has(role)) ?? roles[0];
      used.add(member.rp);
    }
  }

  function applyStoredRoles() {
    const used = new Set();
    for (const member of party) {
      const savedRole = roleByName[member.name];
      if (roles.includes(savedRole) && !used.has(savedRole)) {
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
    const defaultRoleByName = new Map(defaultParty.map((member) => [member.name, member.rp]));
    for (const member of missingMembers) {
      const preferred = defaultRoleByName.get(member.name);
      if (roles.includes(preferred) && !used.has(preferred)) {
        member.rp = preferred;
        used.add(preferred);
        continue;
      }
      const fallback = roles.find((role) => !used.has(role)) ?? roles[0];
      member.rp = fallback;
      used.add(fallback);
    }
  }

  function saveRoles() {
    roleByName = Object.fromEntries(party.map((member) => [member.name, member.rp]));
    writeJson(storageKey, roleByName);
  }

  function setParty(rawParty) {
    party = (rawParty ?? [])
      .map(normalizeMember)
      .filter((member) => member.inParty)
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
      slot.classList.toggle('empty', member === undefined);
      slot.classList.toggle('duplicate', duplicateRoles.has(role));
      slot.classList.toggle('self', member?.name === currentPlayerName);
      slot.querySelector('.role-chip').textContent = role;
      const memberName = slot.querySelector('.member-name');
      memberName.textContent = member?.name ?? '未分配';
      memberName.tabIndex = 0;
      slot.querySelector('.member-job').textContent = member === undefined ? '' : jobNames[member.job] ?? `Job ${member.job}`;
      const select = createMemberSelect(role, member?.name);
      memberName.addEventListener('keydown', (event) => {
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
    partySummary.textContent = party.length > 0 ? `${party.length} 人 / ${assignedRoleCount} 职能` : '等待小队数据';
    if (duplicateRoles.size > 0)
      statusText.textContent = `存在重复职能：${[...duplicateRoles].join('/')}`;
    else if (missingRoles.length > 0)
      statusText.textContent = `未分配：${missingRoles.join('/')}`;
    else
      statusText.textContent = '拖拽玩家或点击名字调整职能。';
  }

  function openMemberSelect(select) {
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
  }

  function defaultSort() {
    assignDefaultRoles(party);
    saveRoles();
    render();
    scheduleBroadcast();
  }

  function buildPayload() {
    return party.map((member) => ({
      id: member.id,
      name: member.name,
      rp: member.rp,
    }));
  }

  function broadcast() {
    clearTimeout(pendingBroadcastTimer);
    if (party.length === 0) {
      statusText.textContent = '暂无小队数据，未广播。';
      return;
    }
    const payload = buildPayload();
    if (hasOverlayApi()) {
      window.callOverlayHandler({
        call: 'broadcast',
        source: 'stringRuntimeJS',
        msg: { party: payload },
      });
    } else {
      console.info('String Runtime mock broadcast', payload);
    }
    const now = new Date();
    lastBroadcastText.textContent = `已广播 ${now.toLocaleTimeString('zh-CN', { hour12: false })}`;
  }

  function scheduleBroadcast(force = false) {
    clearTimeout(pendingBroadcastTimer);
    if (!force && !autoBroadcastInput.checked)
      return;
    pendingBroadcastTimer = setTimeout(broadcast, 120);
  }

  function handleBroadcastMessage(message) {
    const text = message?.msg?.text;
    if ((message?.source === 'stringUserJS' || message?.source === 'soumaUserJS') && text === 'requestData')
      broadcast();
  }

  function handlePrimaryPlayer(event) {
    currentPlayerName = event?.charName ?? event?.name ?? '';
    render();
  }

  function setupOverlay() {
    autoBroadcastInput.checked = window.localStorage.getItem(autoBroadcastKey) === 'true';
    autoBroadcastInput.addEventListener('change', () => {
      window.localStorage.setItem(autoBroadcastKey, String(autoBroadcastInput.checked));
      if (autoBroadcastInput.checked)
        scheduleBroadcast(true);
    });

    defaultSortButton.addEventListener('click', defaultSort);
    broadcastButton.addEventListener('click', broadcast);

    window.stringRuntimeDebug = { setParty, buildPayload, swapRoleSlots, defaultSort };

    if (!hasOverlayApi()) {
      connectionState.textContent = '演示';
      connectionState.className = 'state state-mock';
      setParty([
        { id: 'E000001', name: 'Alpha Tank', job: 21, inParty: true },
        { id: 'E000002', name: 'Bravo Tank', job: 32, inParty: true },
        { id: 'E000003', name: 'Calm Healer', job: 33, inParty: true },
        { id: 'E000004', name: 'Delta Healer', job: 40, inParty: true },
        { id: 'E000005', name: 'Echo Viper', job: 41, inParty: true },
        { id: 'E000006', name: 'Foxtrot Samurai', job: 34, inParty: true },
        { id: 'E000007', name: 'Gamma Dancer', job: 38, inParty: true },
        { id: 'E000008', name: 'Hotel Pict', job: 42, inParty: true },
      ]);
      handlePrimaryPlayer({ charName: 'Echo Viper' });
      return;
    }

    connectionState.textContent = '已连接';
    connectionState.className = 'state state-live';
    window.addOverlayListener('PartyChanged', (event) => setParty(event.party));
    window.addOverlayListener('ChangePrimaryPlayer', handlePrimaryPlayer);
    window.addOverlayListener('BroadcastMessage', handleBroadcastMessage);
    window.callOverlayHandler({
      call: 'broadcast',
      source: 'stringRuntimeJS',
      msg: { text: 'ready' },
    });
    if (typeof window.startOverlayEvents === 'function')
      window.startOverlayEvents();
  }

  setupOverlay();
})();

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function setup() {
  let activate;
  const moves = [];
  const classes = { add() {}, remove() {} };
  const preview = { removeAttribute() {}, querySelectorAll: () => [], classList: classes, setAttribute() {}, style: {}, remove() {} };
  const card = { getAttribute: () => 'story-1', offsetWidth: 220, offsetHeight: 140, classList: classes, cloneNode: () => preview };
  const target = { closest: selector => selector === '[data-task-id]' ? card : null };
  const context = vm.createContext({
    Date, Math,
    document: {
      getElementById: () => ({ style: { setProperty() {}, removeProperty() {} } }),
      addEventListener() {}, querySelectorAll: () => [],
      body: { appendChild() {} },
      elementFromPoint: () => ({ closest: () => ({ getAttribute: () => 'done', querySelector: () => ({ querySelectorAll: () => [], classList: classes }) }) }),
    },
    window: {
      setTimeout: fn => { activate = fn; return 1; }, clearTimeout: () => { activate = null; },
      cancelAnimationFrame() {},
    },
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../scripts/board.js'), 'utf8'), context);
  const animate = context.animateBoardTouch;
  context.animateBoardTouch = () => {};
  context.updateBoardDropTargets = () => {};
  context.moveBoardTask = (id, status) => moves.push([id, status]);
  return { context, target, moves, animate, activate: () => activate?.(), state: () => vm.runInContext('boardState', context) };
}

test('dragging scrolls upward even when the header is above the viewport', () => {
  const app = setup();
  const scrolls = [];
  app.context.document.querySelector = selector => ({
    getBoundingClientRect: () => selector === '.app-header' ? { bottom: -600 } : { top: 720 },
  });
  app.context.window.scrollBy = (x, y) => scrolls.push(y);
  app.context.window.requestAnimationFrame = () => 1;
  app.context.window.innerHeight = 800;
  app.context.startBoardTouch({ target: app.target, touches: [{ clientX: 40, clientY: 30 }] });
  app.activate();
  app.animate();
  assert.deepEqual(scrolls, [-10]);
  app.state().touchDrag.y = 690;
  app.animate();
  assert.deepEqual(scrolls, [-10, 10]);
  app.state().touchDrag.y = 350;
  app.animate();
  assert.deepEqual(scrolls, [-10, 10]);
});

test('long press and release over a column moves a story and suppresses opening its detail', () => {
  const app = setup();
  app.context.startBoardTouch({ target: app.target, touches: [{ clientX: 40, clientY: 200 }] });
  app.activate();
  let prevented = false;
  app.context.finishBoardTouch({ preventDefault: () => { prevented = true; }, changedTouches: [{ clientX: 40, clientY: 500 }] });
  assert.deepEqual(app.moves, [['story-1', 'done']]);
  assert.equal(prevented, true);
  assert.equal(app.state().touchDrag, null);
  assert.equal(app.state().draggingTaskId, null);
  assert.ok(app.state().suppressClickUntil > Date.now());
});

test('swiping before the long press leaves scrolling available and does not move a task', () => {
  const app = setup();
  app.context.startBoardTouch({ target: app.target, touches: [{ clientX: 40, clientY: 200 }] });
  app.context.moveBoardTouch({ touches: [{ clientX: 40, clientY: 230 }], preventDefault: () => assert.fail('Scroll blocked') });
  app.activate();
  assert.equal(app.state().touchDrag, null);
  assert.deepEqual(app.moves, []);
});

test('touch cancellation after activation does not save a new status', () => {
  const app = setup();
  app.context.startBoardTouch({ target: app.target, touches: [{ clientX: 40, clientY: 200 }] });
  app.activate();
  app.context.cancelBoardTouch();
  assert.equal(app.state().touchDrag, null);
  assert.equal(app.state().draggingTaskId, null);
  assert.deepEqual(app.moves, []);
});

test('cards can move before, between and after target cards, including within a column', () => {
  const { context } = setup();
  const tasks = [{ id: 'a', status: 'todo', title: 'Keep me' }, { id: 'b', status: 'inprogress' }, { id: 'c', status: 'inprogress' }];
  const before = context.reorderBoardTasks(tasks, 'a', 'inprogress', 'b');
  assert.deepEqual(Array.from(before, task => task.id), ['a', 'b', 'c']);
  assert.equal(before[0].status, 'inprogress');
  const between = context.reorderBoardTasks(tasks, 'a', 'inprogress', 'c');
  assert.deepEqual(Array.from(between, task => task.id), ['b', 'a', 'c']);
  const after = context.reorderBoardTasks(tasks, 'a', 'inprogress', null);
  assert.deepEqual(Array.from(after, task => task.id), ['b', 'c', 'a']);
  assert.equal(after[2].title, 'Keep me');
  const within = context.reorderBoardTasks(after, 'a', 'inprogress', 'b');
  assert.deepEqual(Array.from(within, task => task.id), ['a', 'b', 'c']);
  const empty = context.reorderBoardTasks(tasks, 'a', 'done', null);
  assert.equal(empty[2].status, 'done');
  assert.equal(tasks[0].status, 'todo');
});

test('finger position chooses the gap before or after a card', () => {
  const { context } = setup();
  const marked = [];
  const card = { getAttribute: () => 'b', getBoundingClientRect: () => ({ top: 100, height: 100 }), classList: { add: name => marked.push(name) } };
  context.document.elementFromPoint = () => ({ closest: () => ({
    getAttribute: () => 'inprogress', querySelector: () => ({ querySelectorAll: () => [card] }),
  }) });
  const drag = { x: 40, y: 120 };
  context.updateBoardTouchTarget(drag);
  assert.equal(drag.beforeTaskId, 'b');
  assert.equal(drag.status, 'inprogress');
  drag.y = 180;
  context.updateBoardTouchTarget(drag);
  assert.equal(drag.beforeTaskId, null);
  assert.deepEqual(marked, ['task-card--insert-before', 'task-card--insert-after']);
});

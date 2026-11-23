/* Afghan date (Solar Hijri) field plug-in for SurveyCTO
 * Field type: text.  Appearance: custom-afghan-date(...)
 * Parameters (all optional):
 *   save      'gregorian' (default) -> 2026-11-23
 *             'afghan'              -> 1405-09-02
 *             'both'                -> 2026-11-23 1405-09-02
 *   labels    'dari' | 'pashto' | 'english'  (default: from the form language)
 *   digits    'persian' | 'latin'            (default: persian for Dari/Pashto)
 *   min_year  earliest Afghan year in the list (default 1300)
 *   max_year  latest Afghan year in the list   (default: current Afghan year)
 *   today     'no' hides the Today button
 */

/* global fieldProperties, setAnswer, getPluginParameter, AfghanCal */

var TEXT = {
  dari: {
    months: ['حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله', 'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت'],
    day: 'روز', month: 'ماه', year: 'سال', today: 'امروز', clear: 'پاک کردن',
    gregorian: 'میلادی', pick: '—', rtl: true
  },
  pashto: {
    months: ['وری', 'غویی', 'غبرگولی', 'چنگاښ', 'زمری', 'وږی', 'تله', 'لړم', 'لیندۍ', 'مرغومی', 'سلواغه', 'کب'],
    day: 'ورځ', month: 'میاشت', year: 'کال', today: 'نن', clear: 'پاکول',
    gregorian: 'میلادي', pick: '—', rtl: true
  },
  english: {
    months: ['Hamal', 'Sawr', 'Jawza', 'Saratan', 'Asad', 'Sunbula', 'Mizan', 'Aqrab', 'Qaws', 'Jadi', 'Dalw', 'Hoot'],
    day: 'Day', month: 'Month', year: 'Year', today: 'Today', clear: 'Clear',
    gregorian: 'Gregorian', pick: '—', rtl: false
  }
};
var GREG_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function param(name, fallback) {
  var v = getPluginParameter(name);
  if (v === undefined || v === null || String(v).replace(/\s/g, '') === '') { return fallback; }
  return String(v).replace(/^\s+|\s+$/g, '').toLowerCase();
}

function detectLabels() {
  var lang = String(fieldProperties.LANGUAGE || '').toLowerCase();
  if (/pashto|pushto|pashtu|^ps\b/.test(lang)) { return 'pashto'; }
  if (/dari|farsi|persian|^fa\b|^prs\b/.test(lang)) { return 'dari'; }
  return 'english';
}

var labelsKey = param('labels', detectLabels());
if (!TEXT[labelsKey]) { labelsKey = 'english'; }
var T = TEXT[labelsKey];
var digitMode = param('digits', T.rtl ? 'persian' : 'latin');
var saveMode = param('save', 'gregorian');
var showToday = param('today', 'yes') !== 'no';

var now = new Date();
var todayAf = AfghanCal.toAfghan(now.getFullYear(), now.getMonth() + 1, now.getDate());
var minYear = parseInt(param('min_year', '1300'), 10);
var maxYear = parseInt(param('max_year', String(todayAf.jy)), 10);
if (isNaN(minYear)) { minYear = 1300; }
if (isNaN(maxYear)) { maxYear = todayAf.jy; }
if (minYear > maxYear) { var tmp = minYear; minYear = maxYear; maxYear = tmp; }

var root = document.getElementById('afd');
var selDay = document.getElementById('sel-day');
var selMonth = document.getElementById('sel-month');
var selYear = document.getElementById('sel-year');
var echo = document.getElementById('echo');
var btnToday = document.getElementById('btn-today');
var btnClear = document.getElementById('btn-clear');

function num(n) {
  var s = String(n);
  if (digitMode !== 'persian') { return s; }
  var fa = '۰۱۲۳۴۵۶۷۸۹';
  return s.replace(/[0-9]/g, function (d) { return fa.charAt(+d); });
}
function pad(n) { return (n < 10 ? '0' : '') + n; }

function addOption(sel, value, text) {
  var o = document.createElement('option');
  o.value = value;
  o.textContent = text;
  sel.appendChild(o);
}

function fillDays(count, keep) {
  selDay.innerHTML = '';
  addOption(selDay, '', T.pick);
  for (var d = 1; d <= count; d += 1) { addOption(selDay, String(d), num(d)); }
  selDay.value = keep && +keep <= count ? String(keep) : '';
}

function build() {
  root.setAttribute('dir', T.rtl ? 'rtl' : 'ltr');
  document.getElementById('cap-day').textContent = T.day;
  document.getElementById('cap-month').textContent = T.month;
  document.getElementById('cap-year').textContent = T.year;
  btnToday.textContent = T.today;
  btnClear.textContent = T.clear;
  btnToday.hidden = !showToday;

  addOption(selMonth, '', T.pick);
  for (var m = 1; m <= 12; m += 1) { addOption(selMonth, String(m), T.months[m - 1] + ' (' + num(m) + ')'); }

  addOption(selYear, '', T.pick);
  for (var y = maxYear; y >= minYear; y -= 1) { addOption(selYear, String(y), num(y)); }

  fillDays(31, '');
}

function daysFor(jy, jm) {
  if (!jm) { return 31; }
  if (!jy) { return jm <= 6 ? 31 : 30; }
  return AfghanCal.monthLength(jy, jm);
}

function render() {
  var jy = +selYear.value, jm = +selMonth.value, jd = +selDay.value;
  fillDays(daysFor(jy, jm), selDay.value);
  jd = +selDay.value;
  if (jy && jm && jd) {
    var g = AfghanCal.toGregorian(jy, jm, jd);
    echo.textContent = T.gregorian + ': ';
    var iso = document.createElement('bdi');
    iso.setAttribute('dir', 'ltr');
    iso.textContent = num(g.gd) + ' ' + GREG_MONTHS[g.gm - 1] + ' ' + num(g.gy);
    echo.appendChild(iso);
    return { af: { jy: jy, jm: jm, jd: jd }, g: g };
  }
  echo.textContent = '';
  return null;
}

function save() {
  var r = render();
  if (!r) { setAnswer(''); return; }
  var gStr = r.g.gy + '-' + pad(r.g.gm) + '-' + pad(r.g.gd);
  var aStr = r.af.jy + '-' + pad(r.af.jm) + '-' + pad(r.af.jd);
  if (saveMode === 'afghan') { setAnswer(aStr); }
  else if (saveMode === 'both') { setAnswer(gStr + ' ' + aStr); }
  else { setAnswer(gStr); }
}

function setSelects(jy, jm, jd) {
  if (jy > maxYear || jy < minYear) { addOption(selYear, String(jy), num(jy)); }
  selYear.value = String(jy);
  selMonth.value = String(jm);
  fillDays(daysFor(jy, jm), jd);
}

function loadAnswer(value) {
  var parts = String(value || '').split(/\s+/), af = null, i, m;
  for (i = 0; i < parts.length && !af; i += 1) {
    m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(parts[i]);
    if (!m) { continue; }
    if (+m[1] < 1700) { af = { jy: +m[1], jm: +m[2], jd: +m[3] }; }
    else { af = AfghanCal.toAfghan(+m[1], +m[2], +m[3]); }
  }
  if (af) { setSelects(af.jy, af.jm, af.jd); }
  render();
}

/* Functions SurveyCTO calls */
function clearAnswer() {
  selYear.value = '';
  selMonth.value = '';
  fillDays(31, '');
  echo.textContent = '';
}
function setFocus() {
  if (!fieldProperties.READONLY) { selDay.focus(); }
}

/* Wiring */
build();
loadAnswer(fieldProperties.CURRENT_ANSWER);

if (fieldProperties.READONLY) {
  selDay.disabled = true; selMonth.disabled = true; selYear.disabled = true;
} else {
  selDay.addEventListener('change', save);
  selMonth.addEventListener('change', save);
  selYear.addEventListener('change', save);
  btnToday.addEventListener('click', function () {
    setSelects(todayAf.jy, todayAf.jm, todayAf.jd);
    save();
  });
  btnClear.addEventListener('click', function () {
    clearAnswer();
    setAnswer('');
  });
}

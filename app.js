// Initialize Lucide Icons
lucide.createIcons();

// ==================== STATE & DATA ====================
let dailyGoal = 1800;
let waterCount = Number(localStorage.getItem('healthybite_water')) || 5;
let selectedCategory = localStorage.getItem('healthybite_category') || 'ทั้งหมด';
let isProfileEditing = false;

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMealDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(year, month - 1, day));
}

let userProfile = {
  name: 'วี่ (Vee)',
  gender: 'female',
  age: 26,
  weight: 55,
  height: 162,
  goalOffset: 0,
  allergy: '',
  condition: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
};

const recipesData = [
  {
    id: 1,
    name: 'ข้าวไรซ์เบอร์รีอกไก่ย่างสมุนไพร',
    category: 'โปรตีนสูง',
    cal: 380,
    protein: 36,
    carb: 42,
    fat: 7,
    sodium: 320,
    time: '20 นาที',
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    name: 'สลัดอะโวคาโดแซลมอนย่าง',
    category: 'คีโต',
    cal: 420,
    protein: 28,
    carb: 12,
    fat: 29,
    sodium: 280,
    time: '15 นาที',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 3,
    name: 'สุกี้น้ำอกไก่ไข่นุ่ม',
    category: 'ลดน้ำหนัก',
    cal: 290,
    protein: 31,
    carb: 26,
    fat: 6,
    sodium: 490,
    time: '15 นาที',
    img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 4,
    name: 'โอ๊ตมีลกรีกโยเกิร์ตเบอร์รีรวม',
    category: 'ลดน้ำหนัก',
    cal: 260,
    protein: 16,
    carb: 38,
    fat: 5,
    sodium: 95,
    time: '10 นาที',
    img: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 5,
    name: 'สเต๊กปลาแซลมอนหน่อไม้ฝรั่ง',
    category: 'โปรตีนสูง',
    cal: 410,
    protein: 34,
    carb: 10,
    fat: 25,
    sodium: 250,
    time: '20 นาที',
    img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=500&q=80'
  }
];

const defaultLoggedMeals = [
  { name: 'โอ๊ตมีลกรีกโยเกิร์ตเบอร์รีรวม', cal: 260, protein: 16, carb: 38, fat: 5, date: getLocalDateKey() },
  { name: 'สลัดอะโวคาโดแซลมอนย่าง', cal: 470, protein: 51, carb: 12, fat: 19, date: getLocalDateKey() }
];
let loggedMeals = defaultLoggedMeals;

try {
  const savedMeals = localStorage.getItem('healthybite_meals');
  if (savedMeals) {
    const parsedMeals = JSON.parse(savedMeals);
    if (Array.isArray(parsedMeals)) {
      loggedMeals = parsedMeals.map(meal => ({
        ...meal,
        date: meal.date || getLocalDateKey()
      }));
      localStorage.setItem('healthybite_meals', JSON.stringify(loggedMeals));
    }
  }
} catch (error) {
  console.error('Unable to load saved meals:', error);
}

const scanPresets = {
  healthy: {
    name: 'สลัดอกไก่ย่างและผักรวม',
    cal: 310,
    protein: '35g',
    carb: '14g',
    fat: '11g',
    sugar: '4g (ต่ำ)',
    sodium: '310mg (ปกติ)',
    score: '92/100',
    isHealthy: true,
    alertTitle: 'ดีต่อสุขภาพ! แนะนำให้ทานได้',
    alertDesc: 'มีโปรตีนสูง ไขมันต่ำ และอุดมไปด้วยใยอาหารจากผักใบเขียว เหมาะสำหรับการควบคุมน้ำหนักและสร้างกล้ามเนื้อ',
    img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
    raw: { cal: 310, protein: 35, carb: 14, fat: 11 }
  },
  unhealthy_fried: {
    name: 'ไก่ทอดกรอบ + เฟรนช์ฟรายส์',
    cal: 890,
    protein: '28g',
    carb: '68g',
    fat: '54g',
    sugar: '3g (ต่ำ)',
    sodium: '1,480mg (สูงมาก!)',
    score: '34/100',
    isHealthy: false,
    alertTitle: 'คำเตือน: ไขมันอิ่มตัวและโซเดียมสูงมาก!',
    alertDesc: 'อาหารทอดใช้น้ำมันซ้ำมีไขมันทรานส์และโซเดียมสูงถึง 74% ของปริมาณที่ควรได้รับต่อวัน เสี่ยงต่อการบวมน้ำและไขมันอุดตัน แนะนำให้ลอกหนังออกหรือทานคู่ผักสด',
    img: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    raw: { cal: 890, protein: 28, carb: 68, fat: 54 }
  },
  unhealthy_sweet: {
    name: 'ชานมไข่มุกบราวน์ชูการ์ (แก้วใหญ่)',
    cal: 520,
    protein: '3g',
    carb: '88g',
    fat: '16g',
    sugar: '58g (เกินพิกัด!)',
    sodium: '190mg (ปกติ)',
    score: '28/100',
    isHealthy: false,
    alertTitle: 'คำเตือน: ปริมาณน้ำตาลสูงเกินเกณฑ์รายวัน!',
    alertDesc: 'มีน้ำตาลสูงถึง 14.5 ช้อนชา (เกณฑ์ปกติไม่ควรเกิน 6 ช้อนชา/วัน) ทำให้ระดับอินซูลินพุ่งสูงและสะสมเป็นไขมันหน้าท้อง แนะนำให้สั่งหวาน 0-25% หรือเปลี่ยนเป็นชาเขียวไม่ใส่น้ำตาล',
    img: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=600&q=80',
    raw: { cal: 520, protein: 3, carb: 88, fat: 16 }
  }
};

// ==================== PROFILE & STORAGE ====================
function loadProfile() {
  const saved = localStorage.getItem('healthybite_profile');
  if (saved) {
    try {
      userProfile = { ...userProfile, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
  }
  applyProfileToUI();
  setProfileEditing(false);
}

function setProfileEditing(isEditing) {
  isProfileEditing = isEditing;
  ['prof-name', 'prof-gender', 'prof-age', 'prof-weight', 'prof-height', 'prof-goal', 'prof-allergy', 'prof-condition', 'profile-avatar-input']
    .forEach(id => {
      const field = document.getElementById(id);
      if (field) field.disabled = !isEditing;
    });

  const editButton = document.getElementById('profile-edit-button');
  const saveButton = document.getElementById('profile-save-button');
  const cancelButton = document.getElementById('profile-cancel-button');
  const editHint = document.getElementById('profile-edit-hint');
  const avatarControl = document.getElementById('profile-avatar-control');
  const avatarCamera = document.getElementById('profile-avatar-camera');

  if (editButton) editButton.classList.toggle('hidden', isEditing);
  if (saveButton) saveButton.classList.toggle('hidden', !isEditing);
  if (cancelButton) cancelButton.classList.toggle('hidden', !isEditing);
  if (editHint) {
    editHint.innerText = isEditing
      ? 'กำลังแก้ไขข้อมูล กดบันทึกเพื่อยืนยัน หรือยกเลิกเพื่อคืนค่าเดิม'
      : 'ข้อมูลนี้ใช้คำนวณเป้าหมายแคลอรีและช่วยปรับคำแนะนำอาหาร';
  }
  if (avatarCamera) avatarCamera.classList.toggle('hidden', !isEditing);
  if (avatarControl) {
    avatarControl.classList.toggle('pointer-events-none', !isEditing);
    avatarControl.classList.toggle('cursor-pointer', isEditing);
    avatarControl.setAttribute('aria-disabled', String(!isEditing));
  }
}

function beginProfileEdit() {
  setProfileEditing(true);
}

function cancelProfileEdit() {
  loadProfile();
  showToast('ยกเลิกการแก้ไขและคืนค่าข้อมูลเดิมแล้ว');
}

function openAvatarPicker() {
  if (!isProfileEditing) return;
  document.getElementById('profile-avatar-input').click();
}

function handleAvatarUpload(event) {
  if (!isProfileEditing) return;
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    userProfile.avatar = e.target.result;
    const profileAvatar = document.getElementById('profile-avatar-img');
    const headerAvatar = document.getElementById('header-avatar');
    if (profileAvatar) profileAvatar.src = userProfile.avatar;
    if (headerAvatar) headerAvatar.src = userProfile.avatar;
    showToast('เปลี่ยนรูปแล้ว กดบันทึกเพื่อยืนยัน');
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  if (!isProfileEditing) return;
  userProfile.name = document.getElementById('prof-name').value.trim() || 'ผู้ใช้งาน';
  userProfile.gender = document.getElementById('prof-gender').value;
  userProfile.age = parseFloat(document.getElementById('prof-age').value) || 25;
  userProfile.weight = parseFloat(document.getElementById('prof-weight').value) || 55;
  userProfile.height = parseFloat(document.getElementById('prof-height').value) || 165;
  userProfile.goalOffset = parseFloat(document.getElementById('prof-goal').value) || 0;
  userProfile.allergy = document.getElementById('prof-allergy').value.trim();
  userProfile.condition = document.getElementById('prof-condition').value.trim();

  localStorage.setItem('healthybite_profile', JSON.stringify(userProfile));
  applyProfileToUI();
  setProfileEditing(false);
  showToast('บันทึกข้อมูลส่วนตัวและอัปเดตแคลอรีแล้ว ✅');
}

function applyProfileToUI() {
  const setValue = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.value = value;
  };
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.innerText = value;
  };
  const setImage = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.src = value;
  };

  setImage('profile-avatar-img', userProfile.avatar);
  setImage('header-avatar', userProfile.avatar);
  setText('profile-display-name', userProfile.name);
  setText('home-user-name', userProfile.name.split(' ')[0]);

  setValue('prof-name', userProfile.name);
  setValue('prof-gender', userProfile.gender);
  setValue('prof-age', userProfile.age);
  setValue('prof-weight', userProfile.weight);
  setValue('prof-height', userProfile.height);
  setValue('prof-goal', userProfile.goalOffset);
  setValue('prof-allergy', userProfile.allergy);
  setValue('prof-condition', userProfile.condition);

  setValue('calc-gender', userProfile.gender);
  setValue('calc-age', userProfile.age);
  setValue('calc-weight', userProfile.weight);
  setValue('calc-height', userProfile.height);
  setValue('calc-goal', userProfile.goalOffset);

  setText('stat-age', userProfile.age);
  setText('stat-weight', userProfile.weight);
  setText('stat-height', userProfile.height);

  // BMI Calculation
  const heightM = userProfile.height / 100;
  const bmi = (userProfile.weight / (heightM * heightM)).toFixed(1);
  let bmiStatus = 'สมส่วน';
  if (bmi < 18.5) bmiStatus = 'น้ำหนักน้อย';
  else if (bmi >= 23 && bmi < 25) bmiStatus = 'ท้วม';
  else if (bmi >= 25) bmiStatus = 'น้ำหนักเกิน';

  const goalText = userProfile.goalOffset < 0 ? 'ลดน้ำหนัก' : (userProfile.goalOffset > 0 ? 'เพิ่มกล้ามเนื้อ' : 'รักษาน้ำหนัก');
  const profileBio = document.getElementById('profile-display-bio');
  if (profileBio) {
    profileBio.innerHTML = `เป้าหมาย: ${goalText} • BMI <span class="font-bold text-emerald-600">${bmi}</span> (${bmiStatus})`;
  }

  // Recalculate TDEE automatically
  let bmr = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age);
  bmr += (userProfile.gender === 'male') ? 5 : -161;
  dailyGoal = Math.round((bmr * 1.375) + userProfile.goalOffset);

  updateDashboard();
}

// ==================== NAVIGATION ====================
function switchTab(tabName) {
  const pages = {
    home: 'index.html',
    recipes: 'recipes.html',
    scan: 'scan.html',
    planner: 'planner.html',
    profile: 'profile.html'
  };
  if (pages[tabName]) window.location.href = pages[tabName];
}

function filterFromHome(category) {
  selectedCategory = category;
  localStorage.setItem('healthybite_category', selectedCategory);
  switchTab('recipes');
  renderRecipes();
}

// ==================== RENDER FUNCTIONS ====================
function updateDashboard() {
  const today = getLocalDateKey();
  const todayMeals = loggedMeals.filter(item => item.date === today);
  const totalCal = todayMeals.reduce((sum, item) => sum + item.cal, 0);
  const totalP = todayMeals.reduce((sum, item) => sum + item.protein, 0);
  const totalC = todayMeals.reduce((sum, item) => sum + item.carb, 0);
  const totalF = todayMeals.reduce((sum, item) => sum + item.fat, 0);

  const remaining = Math.max(0, dailyGoal - totalCal);
  const percent = Math.min(100, Math.round((totalCal / dailyGoal) * 100));

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.innerText = value;
  };
  setText('header-target', dailyGoal.toLocaleString());
  setText('cal-goal-display', dailyGoal.toLocaleString());
  setText('cal-consumed', totalCal.toLocaleString());
  setText('cal-remaining', remaining.toLocaleString());
  setText('macro-p', totalP);
  setText('macro-c', totalC);
  setText('macro-f', totalF);
  setText('planner-cal-consumed', totalCal.toLocaleString());
  setText('planner-cal-goal', dailyGoal.toLocaleString());
  setText('planner-cal-remaining', remaining.toLocaleString());
  setText('planner-macro-p', totalP);
  setText('planner-macro-c', totalC);
  setText('planner-macro-f', totalF);
  setText('today-date', formatMealDate(today));
  setText('planner-date', formatMealDate(today));

  const progressBar = document.getElementById('cal-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
    if (totalCal > dailyGoal) {
      progressBar.classList.replace('bg-orange-400', 'bg-red-500');
    } else {
      progressBar.classList.replace('bg-red-500', 'bg-orange-400');
    }
  }

  const plannerProgress = document.getElementById('planner-cal-progress');
  if (plannerProgress) {
    plannerProgress.style.width = `${percent}%`;
    plannerProgress.classList.toggle('bg-red-500', totalCal > dailyGoal);
    plannerProgress.classList.toggle('bg-orange-400', totalCal <= dailyGoal);
  }

  const listEl = document.getElementById('logged-meals-list');
  if (listEl) {
    setText('logged-count', `${loggedMeals.length} รายการ`);
    const mealsByDate = loggedMeals.reduce((groups, meal, index) => {
      const date = meal.date || today;
      if (!groups[date]) groups[date] = [];
      groups[date].push({ meal, index });
      return groups;
    }, {});
    const dates = Object.keys(mealsByDate).sort((a, b) => b.localeCompare(a));
    listEl.innerHTML = dates.length ? dates.map(date => `
      <section class="space-y-2.5">
        <h3 class="text-xs font-semibold text-gray-500">${date === today ? 'วันนี้ • ' : ''}${formatMealDate(date)}</h3>
        ${mealsByDate[date].map(({ meal, index }) => `
          <div class="flex items-center justify-between bg-gray-50 p-3 rounded-2xl">
            <div>
              <p class="font-semibold text-xs text-gray-800">${meal.name}</p>
              <p class="text-[11px] text-gray-500 mt-0.5">P: ${meal.protein}g • C: ${meal.carb}g • F: ${meal.fat}g</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-bold text-xs text-emerald-600">${meal.cal} kcal</span>
              <button onclick="removeMeal(${index})" class="text-gray-400 hover:text-red-500" aria-label="ลบ ${meal.name}">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </section>
    `).join('') : `
      <div class="text-center py-5">
        <p class="text-sm font-semibold text-gray-700">ยังไม่มีประวัติอาหาร</p>
        <p class="text-xs text-gray-500 mt-1">เพิ่มเมนูที่ทานแล้วเพื่อดูสรุปพลังงาน</p>
        <button onclick="switchTab('recipes')" class="mt-3 text-xs font-semibold text-emerald-600">เลือกเมนูอาหาร →</button>
      </div>
    `;
    lucide.createIcons();
  }
}

function renderHomeFeatured() {
  const container = document.getElementById('home-featured-list');
  if (!container) return;
  container.innerHTML = recipesData.slice(0, 3).map(item => `
    <div class="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3.5">
      <img src="${item.img}" alt="${item.name}" class="w-20 h-20 rounded-xl object-cover shrink-0">
      <div class="flex-1 min-w-0">
        <span class="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">${item.category}</span>
        <h3 class="font-bold text-sm text-gray-900 truncate mt-1">${item.name}</h3>
        <div class="flex items-center gap-3 text-xs text-gray-500 mt-1">
          <span class="font-bold text-orange-500">${item.cal} kcal</span>
          <span>โปรตีน ${item.protein}g</span>
        </div>
      </div>
      <button onclick="addMeal('${item.name}', ${item.cal}, ${item.protein}, ${item.carb}, ${item.fat})" class="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition shrink-0">
        <i data-lucide="plus" class="w-4 h-4"></i>
      </button>
    </div>
  `).join('');
  lucide.createIcons();
}

function renderRecipes() {
  const categories = ['ทั้งหมด', 'ลดน้ำหนัก', 'โปรตีนสูง', 'คีโต'];
  const pillsEl = document.getElementById('category-pills');
  const searchInput = document.getElementById('recipe-search');
  const container = document.getElementById('recipes-container');
  if (!pillsEl || !searchInput || !container) return;
  pillsEl.innerHTML = categories.map(cat => `
    <button onclick="selectedCategory='${cat}'; localStorage.setItem('healthybite_category', selectedCategory); renderRecipes()" class="shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition ${selectedCategory === cat ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'}">
      ${cat}
    </button>
  `).join('');

  const query = searchInput.value.toLowerCase();
  const filtered = recipesData.filter(item => {
    const matchCat = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
    const matchText = item.name.toLowerCase().includes(query);
    return matchCat && matchText;
  });

  container.innerHTML = filtered.map(item => `
    <div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
      <div class="relative">
        <img src="${item.img}" alt="${item.name}" class="w-full h-44 object-cover">
        <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-emerald-700 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
          ${item.category}
        </span>
        <span class="absolute top-3 right-3 bg-gray-900/75 text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1">
          <i data-lucide="clock" class="w-3 h-3"></i> ${item.time}
        </span>
      </div>
      <div class="p-4">
        <div class="flex justify-between items-start">
          <h3 class="font-bold text-base text-gray-900">${item.name}</h3>
          <span class="font-bold text-base text-orange-500 shrink-0">${item.cal} kcal</span>
        </div>

        <div class="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-100 text-center text-xs">
          <div class="bg-emerald-50/70 py-1.5 rounded-xl">
            <span class="block font-bold text-emerald-700">${item.protein}g</span>
            <span class="text-[10px] text-gray-500">โปรตีน</span>
          </div>
          <div class="bg-gray-50 py-1.5 rounded-xl">
            <span class="block font-bold text-gray-800">${item.carb}g</span>
            <span class="text-[10px] text-gray-500">คาร์บ</span>
          </div>
          <div class="bg-gray-50 py-1.5 rounded-xl">
            <span class="block font-bold text-gray-800">${item.fat}g</span>
            <span class="text-[10px] text-gray-500">ไขมัน</span>
          </div>
          <div class="bg-gray-50 py-1.5 rounded-xl">
            <span class="block font-bold text-gray-800">${item.sodium}</span>
            <span class="text-[10px] text-gray-500">โซเดียม(mg)</span>
          </div>
        </div>

        <button onclick="addMeal('${item.name}', ${item.cal}, ${item.protein}, ${item.carb}, ${item.fat})" class="w-full mt-3.5 bg-emerald-600 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-1.5">
          <i data-lucide="plus-circle" class="w-4 h-4"></i> เพิ่มเข้ามื้ออาหารวันนี้
        </button>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

// ==================== SCANNER LOGIC ====================
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('upload-placeholder').classList.add('hidden');
    document.getElementById('image-preview-box').classList.remove('hidden');
    document.getElementById('preview-img').src = e.target.result;

    const keys = ['healthy', 'unhealthy_fried', 'unhealthy_sweet'];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    runScanProcess(scanPresets[randomKey], true);
  };
  reader.readAsDataURL(file);
}

function simulateScan(presetKey) {
  const data = scanPresets[presetKey];
  document.getElementById('upload-placeholder').classList.add('hidden');
  document.getElementById('image-preview-box').classList.remove('hidden');
  document.getElementById('preview-img').src = data.img;
  runScanProcess(data, false);
}

function runScanProcess(data, isCustomUpload) {
  document.getElementById('scan-result-card').classList.add('hidden');
  document.getElementById('scan-loading').classList.remove('hidden');

  setTimeout(() => {
    document.getElementById('scan-loading').classList.add('hidden');
    document.getElementById('scan-result-card').classList.remove('hidden');

    const alertBox = document.getElementById('health-alert-box');
    const alertIcon = document.getElementById('health-alert-icon');
    const alertTitle = document.getElementById('health-alert-title');
    const alertDesc = document.getElementById('health-alert-desc');

    let extraWarning = '';
    if (userProfile.condition && !data.isHealthy) {
      extraWarning = ` (⚠️ ควรระวังเป็นพิเศษเนื่องจากคุณระบุโรคประจำตัว: ${userProfile.condition})`;
    }

    if (data.isHealthy) {
      alertBox.className = 'p-3.5 rounded-2xl flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-900';
      alertIcon.innerHTML = `<i data-lucide="shield-check" class="w-5 h-5 text-emerald-600"></i>`;
      document.getElementById('scan-score').className = 'font-bold text-sm text-emerald-600';
    } else {
      alertBox.className = 'p-3.5 rounded-2xl flex items-start gap-3 bg-red-50 border border-red-200 text-red-900';
      alertIcon.innerHTML = `<i data-lucide="alert-triangle" class="w-5 h-5 text-red-600"></i>`;
      document.getElementById('scan-score').className = 'font-bold text-sm text-red-600';
    }

    alertTitle.innerText = data.alertTitle;
    alertDesc.innerText = data.alertDesc + extraWarning;

    document.getElementById('scan-food-name').innerText = isCustomUpload ? `${data.name} (AI วิเคราะห์)` : data.name;
    document.getElementById('scan-food-cal').innerText = data.cal;
    document.getElementById('scan-p').innerText = data.protein;
    document.getElementById('scan-c').innerText = data.carb;
    document.getElementById('scan-f').innerText = data.fat;
    document.getElementById('scan-sugar').innerText = data.sugar;
    document.getElementById('scan-sodium').innerText = data.sodium;
    document.getElementById('scan-score').innerText = data.score;

    document.getElementById('btn-add-scanned').onclick = function() {
      addMeal(data.name, data.raw.cal, data.raw.protein, data.raw.carb, data.raw.fat);
    };

    lucide.createIcons();
  }, 1100);
}

// ==================== ACTIONS & CALCULATOR ====================
function addMeal(name, cal, protein, carb, fat) {
  loggedMeals.push({ name, cal, protein, carb, fat, date: getLocalDateKey() });
  localStorage.setItem('healthybite_meals', JSON.stringify(loggedMeals));
  updateDashboard();
  showToast(`เพิ่ม "${name}" (+${cal} kcal) แล้ว`);
}

function removeMeal(index) {
  loggedMeals.splice(index, 1);
  localStorage.setItem('healthybite_meals', JSON.stringify(loggedMeals));
  updateDashboard();
  showToast('ลบรายการอาหารแล้ว');
}

function calculateTDEE() {
  const gender = document.getElementById('calc-gender').value;
  const age = parseFloat(document.getElementById('calc-age').value) || 25;
  const weight = parseFloat(document.getElementById('calc-weight').value) || 55;
  const height = parseFloat(document.getElementById('calc-height').value) || 165;
  const goalOffset = parseFloat(document.getElementById('calc-goal').value) || 0;

  userProfile.gender = gender;
  userProfile.age = age;
  userProfile.weight = weight;
  userProfile.height = height;
  userProfile.goalOffset = goalOffset;

  localStorage.setItem('healthybite_profile', JSON.stringify(userProfile));
  applyProfileToUI();
  showToast(`อัปเดตเป้าหมายใหม่: ${dailyGoal.toLocaleString()} kcal/วัน`);
}

function renderWater() {
  const grid = document.getElementById('water-grid');
  const glasses = document.getElementById('water-glasses');
  if (!grid || !glasses) return;
  glasses.innerText = waterCount;
  let html = '';
  for (let i = 1; i <= 8; i++) {
    const active = i <= waterCount;
    html += `
      <div onclick="waterCount=${i}; localStorage.setItem('healthybite_water', waterCount); renderWater()" class="h-9 rounded-lg flex items-center justify-center cursor-pointer transition ${active ? 'bg-white text-blue-600 shadow-sm' : 'bg-white/20 text-white/60'}">
        <i data-lucide="cup-soda" class="w-4 h-4"></i>
      </div>
    `;
  }
  grid.innerHTML = html;
  lucide.createIcons();
}

function updateWater(delta) {
  waterCount = Math.max(0, Math.min(8, waterCount + delta));
  localStorage.setItem('healthybite_water', waterCount);
  renderWater();
  if (delta > 0) showToast(`ดื่มน้ำเพิ่มแล้ว (${waterCount}/8 แก้ว) 💧`);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').innerText = msg;
  toast.classList.remove('opacity-0');
  setTimeout(() => {
    toast.classList.add('opacity-0');
  }, 2200);
}

// ==================== INIT ====================
loadProfile();
document.querySelectorAll('.nav-btn').forEach(button => {
  if (button.dataset.tab === 'scan') return;
  const isActive = button.dataset.tab === document.body.dataset.page;
  button.classList.toggle('text-emerald-600', isActive);
  button.classList.toggle('text-gray-400', !isActive);
});
renderHomeFeatured();
renderRecipes();
renderWater();

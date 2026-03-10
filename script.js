/**
 * 命名規則
 * menuItems           : 商品データ配列
 * domXxx              : DOM要素
 * createXxx           : 要素生成関数
 * renderXxx           : 描画関数
 * getXxx / setXxx     : 値の取得・設定
 * changeXxx           : 増減変更処理
 * food_***            : 食べ物商品ID
 * drink_***           : 飲み物商品ID
 */

/** 商品データ配列 */
const menuItems = [
    { id: "food_neko_parfait", category: "food", name: "ねこぱふぇ", price: 20000 },
    { id: "food_tamagosand", category: "food", name: "厚焼きたまごサンド", price: 20000 },
    { id: "food_aqua_garden", category: "food", name: "アクアガーデン", price: 15000 },
    { id: "food_oct_ajillo", category: "food", name: "オクト・アヒージョ", price: 15000 },
    { id: "food_kucchy", category: "food", name: "クッチー", price: 10000 },

    { id: "drink_night_sky_fizz", category: "drink", name: "ナイトスカイフィズ", price: 20000 },
    { id: "drink_kiraneko_float", category: "drink", name: "キラネコフロート", price: 20000 },
    { id: "drink_chill_soda", category: "drink", name: "チルソーダ", price: 15000 },
    { id: "drink_chocolat_don", category: "drink", name: "ショコラ・ド・ン", price: 15000 },
    { id: "drink_hot_yami_tea", category: "drink", name: "HOTヤミ茶", price: 10000 }
];

/** DOM: 食べ物一覧 */
const domFoodList = document.getElementById("food-list");
/** DOM: 飲み物一覧 */
const domDrinkList = document.getElementById("drink-list");
/** DOM: 小計表示 */
const domSubtotal = document.getElementById("subtotal");
/** DOM: 合計表示 */
const domTotal = document.getElementById("total");
/** DOM: 明細一覧 */
const domDetailList = document.getElementById("detail-list");

/**
 * 金額整形
 * @param {number} value 金額
 * @returns {string} 円表示文字列
 */
function formatCurrency(value) {
    return `¥${value.toLocaleString("ja-JP")}`;
}

/**
 * 商品カードHTMLを作成
 * @param {{ id: string, category: string, name: string, price: number }} item 商品データ
 * @returns {HTMLDivElement} 商品カード要素
 */
function createItemCard(item) {
    const itemCard = document.createElement("div");
    itemCard.className = "item-card";

    itemCard.innerHTML = `
        <div class="item-top">
            <span class="item-name">${item.name}</span>
            <span class="item-price">${formatCurrency(item.price)}</span>
        </div>

        <div class="item-control">
            <button
                type="button"
                class="qty-button"
                data-action="minus"
                data-item-id="${item.id}"
            >-</button>

            <input
                type="number"
                min="0"
                value="0"
                class="qty-input"
                data-item-id="${item.id}"
            />

            <button
                type="button"
                class="qty-button"
                data-action="plus"
                data-item-id="${item.id}"
            >+</button>
        </div>
    `;

    return itemCard;
}

/**
 * 商品一覧描画
 */
function renderMenuLists() {
    domFoodList.innerHTML = "";
    domDrinkList.innerHTML = "";

    menuItems.forEach((item) => {
        const itemCard = createItemCard(item);

        if (item.category === "food") {
            domFoodList.appendChild(itemCard);
            return;
        }

        domDrinkList.appendChild(itemCard);
    });
}

/**
 * 商品IDから数量入力欄取得
 * @param {string} itemId 商品ID
 * @returns {HTMLInputElement | null} 数量入力欄
 */
function getQuantityInput(itemId) {
    return document.querySelector(`.qty-input[data-item-id="${itemId}"]`);
}

/**
 * 商品数量取得
 * @param {string} itemId 商品ID
 * @returns {number} 数量
 */
function getItemQuantity(itemId) {
    const input = getQuantityInput(itemId);

    if (!input) {
        return 0;
    }

    const numericValue = Number(input.value);

    if (Number.isNaN(numericValue) || numericValue < 0) {
        return 0;
    }

    return Math.floor(numericValue);
}

/**
 * 商品数量設定
 * @param {string} itemId 商品ID
 * @param {number} quantity 設定数量
 */
function setItemQuantity(itemId, quantity) {
    const input = getQuantityInput(itemId);

    if (!input) {
        return;
    }

    const safeQuantity = Math.max(0, Math.floor(quantity));
    input.value = String(safeQuantity);
}

/**
 * +-ボタンで数量変更
 * @param {string} itemId 商品ID
 * @param {number} diff 増減値
 */
function changeItemQuantity(itemId, diff) {
    const currentQuantity = getItemQuantity(itemId);
    const nextQuantity = currentQuantity + diff;

    setItemQuantity(itemId, nextQuantity);
    renderSummary();
}

/**
 * 集計計算
 * @returns {{
 *   subtotal: number,
 *   total: number,
 *   detailLines: string[]
 * }}
 */
function calculateSummary() {
    let subtotal = 0;
    const detailLines = [];

    menuItems.forEach((item) => {
        const quantity = getItemQuantity(item.id);

        if (quantity <= 0) {
            return;
        }

        const lineTotal = item.price * quantity;
        subtotal += lineTotal;

        detailLines.push(`${item.name} × ${quantity} = ${formatCurrency(lineTotal)}`);
    });

    return {
        subtotal,
        total: subtotal,
        detailLines
    };
}

/**
 * 集計表示更新
 */
function renderSummary() {
    const summary = calculateSummary();

    domSubtotal.textContent = formatCurrency(summary.subtotal);
    domTotal.textContent = formatCurrency(summary.total);

    domDetailList.innerHTML = "";

    if (summary.detailLines.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "empty-text";
        emptyItem.textContent = "商品がまだ選択されていません";
        domDetailList.appendChild(emptyItem);
        return;
    }

    summary.detailLines.forEach((line) => {
        const detailItem = document.createElement("li");
        detailItem.textContent = line;
        domDetailList.appendChild(detailItem);
    });
}

/**
 * クリックイベント登録
 */
function bindClickEvents() {
    document.addEventListener("click", (event) => {
        const target = event.target;

        if (!(target instanceof HTMLElement)) {
            return;
        }

        if (!target.classList.contains("qty-button")) {
            return;
        }

        const itemId = target.dataset.itemId;
        const action = target.dataset.action;

        if (!itemId || !action) {
            return;
        }

        if (action === "minus") {
            changeItemQuantity(itemId, -1);
            return;
        }

        if (action === "plus") {
            changeItemQuantity(itemId, 1);
        }
    });
}

/**
 * 入力イベント登録
 */
function bindInputEvents() {
    document.addEventListener("input", (event) => {
        const target = event.target;

        if (!(target instanceof HTMLInputElement)) {
            return;
        }

        if (!target.classList.contains("qty-input")) {
            return;
        }

        if (target.value === "") {
            renderSummary();
            return;
        }

        const numericValue = Number(target.value);

        if (Number.isNaN(numericValue) || numericValue < 0) {
            target.value = "0";
        } else {
            target.value = String(Math.floor(numericValue));
        }

        renderSummary();
    });
}

/**
 * 初期化
 */
function initializePage() {
    renderMenuLists();
    bindClickEvents();
    bindInputEvents();
    renderSummary();
}

initializePage();

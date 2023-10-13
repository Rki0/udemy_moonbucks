// step 1 요구 사항 구현을 위한 전략
// TODO: 메뉴 추가
// 메뉴의 이름을 입력 받고 확인 버튼을 클릭하면 메뉴가 추가된다.
// 메뉴의 이름을 입력 받고 엔터 버튼을 누르면 메뉴가 추가된다.
// 추가되는 메뉴의 마크업은 <ul id="menu-list" class="mt-3 pl-0"></ul> 안에 삽입해야 한다.
// 총 메뉴 갯수를 count하여 상단에 보여준다.
// 메뉴가 추가되고 나면, input은 빈 값으로 초기화한다.
// 사용자 입력값이 빈 값이라면 추가되지 않는다.

// TODO: 메뉴 수정
// 메뉴의 수정 버튼을 눌러 메뉴 이름 수정할 수 있다.
// 메뉴 수정시 브라우저에서 제공하는 prompt 인터페이스를 활용한다.

// TODO: 메뉴 삭제
// 메뉴 삭제 버튼을 이용하여 메뉴 삭제할 수 있다.
// 메뉴 삭제시 브라우저에서 제공하는 confirm 인터페이스를 활용한다.
// 총 메뉴 갯수를 count하여 상단에 보여준다.

// step 2 요구 사항 구현을 위한 전략
// TODO: localStorage Read & Write
// localStorage에 데이터를 저장한다.(추가, 수정, 삭제)
// localStorage에 있는 데이터를 읽어온다.

// TODO: 카테고리 별 메뉴판 관리
// 에스프레소 메뉴판 관리
// 프라푸치노 메뉴판 관리
// 블렌디드 메뉴판 관리
// 티바나 메뉴판 관리
// 디저트 메뉴판 관리

// TODO: 페이지 접근 시 최로 데이터 Read & Rendering
// 페이지에 최초로 접근할 때는 localStorage에 있는 에스프레소 메뉴를 읽어온다.
// 에스프레소 메뉴를 보여준다.

// TODO:
// 품절 버튼을 추가한다.
// 품절 버튼을 클릭하면 localStorage에 상태를 저장한다.
// 클릭 이벤트에서 가장 가까운 태그의 li 태그의 class 속성 값에 sold-out을 추가한다.

// step 3 요구 사항 구현을 위한 전략
// 웹 서버를 띄운다
// 서버에 새로운 메뉴명이 추가될 수 있도록 요청한다.
// 서버에 중복되는 메뉴명이 추가될 수 없도록 한다.
// 서버에 카테고리별 메뉴리스트를 요청한다.
// 서버에 메뉴명을 수정될 수 있도록 요청한다.
// 서버에 품절 상태가 수정될 수 있도록 요청한다.
// 서버에 메뉴명을 삭제되도록 요청한다.
// localStorage에 저장하는 로직은 지운다.
// fetch 비동기 api를 사용하는 부분을 async await을 사용하여 구현한다.
// API 통신이 실패하는 경우에 대해 사용자가 알 수 있게 alert으로 예외처리를 진행한다.

import { $ } from "./utils/dom.js";
import store from "./store/index.js";
import MenuApi from "../api/index.js";

function App() {
  // 상태(변하는 것) - 메뉴 명, 품절 여부
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: [],
  };

  this.currentCategory = "espresso";

  this.init = async () => {
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
    );

    render();

    initEventListener();
  };

  const render = async () => {
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
    );

    const template = this.menu[this.currentCategory]
      .map((item) => {
        return `<li data-menu-id=${
          item.id
        } class="menu-list-item d-flex items-center py-2">
      <span class="w-100 pl-2 menu-name ${item.isSoldOut ? "sold-out" : ""}">${
          item.name
        }</span>
      <button
      type="button"
      class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
    >
      품절
    </button>
      <button
        type="button"
        class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
      >
        수정
      </button>
      <button
        type="button"
        class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
      >
        삭제
      </button>
      </li>`;
      })
      .join("");

    $("#menu-list").innerHTML = template;

    updateMenuCount();
  };

  const updateMenuCount = () => {
    $(".menu-count").innerText = `총 ${
      this.menu[this.currentCategory].length
    }개`;
  };

  const addMenuName = async () => {
    if ($("#menu-name").value === "") {
      alert("1글자 이상 입력해주세요");
      return;
    }

    const isDuplicatedItem = this.menu[this.currentCategory].find(
      (item) => item.name === $("#menu-name").value
    );

    if (isDuplicatedItem) {
      alert("이미 등록된 메뉴입니다. 다시 입력해주세요.");
      $("#menu-name").value = "";
      return;
    }

    const menuName = $("#menu-name").value;

    await MenuApi.addMenuByCategory(this.currentCategory, menuName);

    render();

    $("#menu-name").value = "";
  };

  const updateMenuName = async (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    const $targetMenu = e.target.closest("li").querySelector(".menu-name");

    const updatedName = prompt(
      "수정할 이름을 입력해주세요.",
      $targetMenu.innerText
    );

    if (updatedName === "") {
      alert("1글자 이상 입력해주세요.");
      return;
    }

    await MenuApi.updateMenuName(this.currentCategory, menuId, updatedName);

    render();
  };

  const removeMenuName = async (e) => {
    if (confirm("정말 메뉴를 삭제하시겠습니까?")) {
      const menuId = e.target.closest("li").dataset.menuId;

      await MenuApi.removeMenu(this.currentCategory, menuId);

      render();
    }
  };

  const soldOutMenu = async (e) => {
    const menuId = e.target.closest("li").dataset.menuId;

    await MenuApi.toggleSoldOutMenu(this.currentCategory, menuId);

    render();
  };

  const changeCategory = (e) => {
    const isCategoryButton = e.target.classList.contains("cafe-category-name");

    if (isCategoryButton) {
      const categoryName = e.target.dataset.categoryName;

      this.currentCategory = categoryName;

      $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;

      render();
    }
  };

  const initEventListener = () => {
    $("#menu-list").addEventListener("click", (e) => {
      if (e.target.classList.contains("menu-edit-button")) {
        updateMenuName(e);
        return;
      }

      if (e.target.classList.contains("menu-remove-button")) {
        removeMenuName(e);
        return;
      }

      if (e.target.classList.contains("menu-sold-out-button")) {
        soldOutMenu(e);
      }
    });

    // form 태그가 자동으로 전송되는 것을 막는다.
    $("#menu-form").addEventListener("submit", (e) => {
      e.preventDefault();
    });

    $("#menu-submit-button").addEventListener("click", addMenuName);

    // 이름을 입력받는다.
    $("#menu-name").addEventListener("keypress", (e) => {
      if (e.key !== "Enter") {
        return;
      }

      addMenuName();
    });

    $("nav").addEventListener("click", async (e) => {
      changeCategory(e);
    });
  };
}

const app = new App();
app.init();

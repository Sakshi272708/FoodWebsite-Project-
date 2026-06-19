const input = document.querySelector("#search");
const clearInput = document.querySelector(".clear-input");
import { applyFilters } from "./filters.js";

export function setupSearch(applyFilters) {

   const input = document.querySelector("#search");
   const clearInput = document.querySelector(".clear-input");

   let timeout;

   input.addEventListener("input", (e) => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
         applyFilters();
      }, 500);
   });

   clearInput.addEventListener("click", () => {
      input.value = "";
      applyFilters();
   });
}

// debounce =means wait till user type then start search or filter
let timeout;
input.addEventListener("input", (e) => {

   let value = e.target.value.trim();
   let words = value
      .toLowerCase()
      .split(" ")
      .filter(word => word !== "");

   clearTimeout(timeout)
   //filter products
   if (value === "") {
      applyFilters()
      return;
   }
   resetSearchstate(input.value)
   timeout = setTimeout(() => {
      applyFilters()
   }, 500);
});

function resetSearchstate(value) {
   if (value === "") {
      clearInput.classList.add("hides");

      return;
   } else {
      clearInput.classList.remove("hides")
   }
}

// clearing input
clearInput.addEventListener("click", () => {
   input.value = "";
   applyFilters()
   resetSearchstate(input.value)
})
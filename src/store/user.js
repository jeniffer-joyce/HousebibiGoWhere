import { reactive } from "vue";

export const user = reactive({
  isLoggedIn: false,
  name: "Mirabelle",
  avatar: "https://i.pravatar.cc/40",
  cart: ["item1", "item2"],
  wishlist: ["itemA"],
  preferences: {
    theme: "dark",
    language: "en"
  }
});
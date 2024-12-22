export const auth = {
  login: (username, password) => {
    // In a real app, you'd hash the password and verify against backend
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      return true;
    }
    return false;
  },

  register: (username, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.some((u) => u.username === username)) {
      return false;
    }

    const newUser = { id: Date.now(), username, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    return true;
  },

  logout: () => {
    localStorage.removeItem("currentUser");
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("currentUser"));
  },
};

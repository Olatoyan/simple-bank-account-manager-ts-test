var CONVERSION_RATE_NGN_TO_USD = 0.5;
var CONVERSION_RATE_USD_TO_NGN = 30;
var users = [];
var transactions = [];
var currentUser = null;
function generateId() {
    return Math.random().toString(36).substring(2, 15);
}
function findUser(username) {
    return users.find(function (user) { return user.username === username; });
}
function findWallet(_a) {
    var user = _a.user, walletId = _a.walletId;
    return user.wallets.find(function (wallet) { return wallet.id === walletId; });
}
function signUp(_a) {
    var username = _a.username, password = _a.password;
    if (findUser(username)) {
        return console.error("User already exists");
    }
    var newUser = {
        username: username,
        password: password,
        wallets: [{ id: generateId(), currency: "NGN", balance: 0 }],
    };
    users.push(newUser);
    console.log("".concat(username, " has been created"));
}
function login(_a) {
    var username = _a.username, password = _a.password;
    var user = findUser(username);
    if (!user || user.password !== password) {
        return console.error("Invalid username or password");
    }
    currentUser = user;
    console.log("Welcome back, ".concat(user.username));
    return user;
}
function logout() {
    console.log("Goodbye ".concat(currentUser === null || currentUser === void 0 ? void 0 : currentUser.username));
    currentUser = null;
    return "Logged out successfully";
}
function createWallet(_a) {
    var currency = _a.currency;
    if (!currentUser)
        return console.error("User not logged in");
    var newWallet = {
        id: generateId(),
        currency: currency,
        balance: 0,
    };
    currentUser.wallets.push(newWallet);
    console.log("A new wallet ".concat(currency, " has been added to ").concat(currentUser.username, " wallets"));
    return "Wallet created successfully";
}
function depositToWallet(_a) {
    var walletId = _a.walletId, amount = _a.amount;
    if (!currentUser)
        return console.error("User not logged in");
    var wallet = findWallet({ user: currentUser, walletId: walletId });
    if (!wallet) {
        return console.error("Wallet not found");
    }
    wallet.balance += amount;
    console.log("".concat(amount, " has been deposited to ").concat(currentUser.username, " ").concat(wallet.currency, " wallet of id ").concat(walletId));
    return "Deposit successful";
}
function deleteWallet(_a) {
    var walletId = _a.walletId;
    if (!currentUser)
        return console.error("User not logged in");
    var wallet = findWallet({ user: currentUser, walletId: walletId });
    if (!wallet) {
        return console.error("Wallet not found");
    }
    if (wallet.balance > 0) {
        return console.error("Wallet has funds and cannot be deleted");
    }
    currentUser.wallets = currentUser.wallets.filter(function (w) { return w.id !== walletId; });
    console.log("".concat(currentUser.username, " ").concat(wallet.currency, " walletID ").concat(walletId, " has been deleted"));
    return "Wallet deleted successfully";
}
function transferFunds(_a) {
    var toUser = _a.toUser, fromWalletId = _a.fromWalletId, toWalletId = _a.toWalletId, amount = _a.amount;
    if (!currentUser)
        return console.error("User not logged in");
    var fromWallet = findWallet({ user: currentUser, walletId: fromWalletId });
    var toWallet = findWallet({ user: toUser, walletId: toWalletId });
    if (!fromWallet || !toWallet) {
        return console.error("Wallet not found");
    }
    var conversionRate = fromWallet.currency === "NGN" && toWallet.currency === "USD"
        ? CONVERSION_RATE_NGN_TO_USD
        : fromWallet.currency === toWallet.currency
            ? 1
            : CONVERSION_RATE_USD_TO_NGN;
    if (fromWallet.balance < amount) {
        return console.error("Insufficient funds");
    }
    console.log("Transferring ".concat(amount, " from ").concat(currentUser.username, " ").concat(fromWallet.currency, " to ").concat(toUser.username, " ").concat(toWallet.currency));
    fromWallet.balance -= amount;
    toWallet.balance += amount * conversionRate;
    transactions.push({
        fromWalletId: fromWalletId,
        toWalletId: toWalletId,
        amount: amount,
        conversionRate: conversionRate,
    });
    return "Transfer successful";
}
// TESTS
signUp({ username: "george", password: "123456789" });
signUp({ username: "toyan", password: "secret" });
signUp({ username: "george", password: "123455" });
login({ username: "george", password: "123456789" });
createWallet({ currency: "USD" });
var georgeNGNWallet = currentUser.wallets[0];
var georgeUSDWallet = currentUser.wallets[1];
depositToWallet({ walletId: georgeNGNWallet.id, amount: 1000000 });
depositToWallet({ walletId: georgeUSDWallet.id, amount: 10000 });
logout();
login({ username: "toyan", password: "secret" });
createWallet({ currency: "USD" });
var toyan = currentUser;
var toyanNGNWallet = toyan.wallets[0];
var toyanUSDWallet = toyan.wallets[1];
logout();
login({ username: "george", password: "123456789" });
transferFunds({
    toUser: toyan,
    fromWalletId: georgeNGNWallet.id,
    toWalletId: toyanNGNWallet.id,
    amount: 5000,
});
transferFunds({
    toUser: toyan,
    fromWalletId: georgeNGNWallet.id,
    toWalletId: toyanUSDWallet.id,
    amount: 5000,
});
transferFunds({
    toUser: toyan,
    fromWalletId: georgeUSDWallet.id,
    toWalletId: toyanUSDWallet.id,
    amount: 5000,
});
transferFunds({
    toUser: toyan,
    fromWalletId: georgeUSDWallet.id,
    toWalletId: toyanNGNWallet.id,
    amount: 500000,
});
transferFunds({
    toUser: toyan,
    fromWalletId: georgeUSDWallet.id,
    toWalletId: toyanNGNWallet.id,
    amount: 5000,
});
deleteWallet({ walletId: georgeNGNWallet.id });
createWallet({ currency: "USD" });
var emptyWallet = currentUser.wallets[currentUser.wallets.length - 1];
deleteWallet({ walletId: emptyWallet.id });
deleteWallet({ walletId: georgeUSDWallet.id });
console.log("George's wallets:", currentUser.wallets);
logout();
login({ username: "toyan", password: "secret" });
console.log("Toyan's wallets:", currentUser.wallets);
console.log("Transactions:", transactions);

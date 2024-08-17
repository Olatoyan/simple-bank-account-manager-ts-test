type User = { username: string; password: string; wallets: Wallet[] };

type Wallet = {
  id: string;
  currency: "NGN" | "USD";
  balance: number;
};

type Transaction = {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  conversionRate: number;
};

type DepositToWallet = { walletId: string; amount: number };

type DeleteWallet = { walletId: string };

type AuthenticateUserType = { username: string; password: string };

type CreateWallet = { currency: "NGN" | "USD" };

type FindWalletType = { user: User; walletId: string };

type TransferFunds = {
  toUser: User;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
};

const CONVERSION_RATE_NGN_TO_USD = 0.5;
const CONVERSION_RATE_USD_TO_NGN = 30;

const users: User[] = [];
const transactions: Transaction[] = [];
let currentUser: User | null = null;

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

function findUser(username: string) {
  return users.find((user) => user.username === username);
}

function findWallet({ user, walletId }: FindWalletType) {
  return user.wallets.find((wallet) => wallet.id === walletId);
}

function signUp({ username, password }: AuthenticateUserType) {
  if (findUser(username)) {
    return console.error("User already exists");
  }

  const newUser: User = {
    username,
    password,
    wallets: [{ id: generateId(), currency: "NGN", balance: 0 }],
  };
  users.push(newUser);
  console.log(`${username} has been created`);
}

function login({ username, password }: AuthenticateUserType) {
  const user = findUser(username);
  if (!user || user.password !== password) {
    return console.error("Invalid username or password");
  }
  currentUser = user;
  console.log(`Welcome back, ${user.username}`);
  return user;
}

function logout() {
  console.log(`Goodbye ${currentUser?.username}`);
  currentUser = null;

  return "Logged out successfully";
}

function createWallet({ currency }: CreateWallet) {
  if (!currentUser) return console.error("User not logged in");
  const newWallet: Wallet = {
    id: generateId(),
    currency,
    balance: 0,
  };

  currentUser.wallets.push(newWallet);
  console.log(
    `A new wallet ${currency} has been added to ${currentUser.username} wallets`
  );
  return "Wallet created successfully";
}

function depositToWallet({ walletId, amount }: DepositToWallet) {
  if (!currentUser) return console.error("User not logged in");
  const wallet = findWallet({ user: currentUser, walletId });
  if (!wallet) {
    return console.error("Wallet not found");
  }
  wallet.balance += amount;

  console.log(
    `${amount} has been deposited to ${currentUser.username} ${wallet.currency} wallet of id ${walletId}`
  );
  return "Deposit successful";
}

function deleteWallet({ walletId }: DeleteWallet) {
  if (!currentUser) return console.error("User not logged in");
  const wallet = findWallet({ user: currentUser, walletId });
  if (!wallet) {
    return console.error("Wallet not found");
  }
  if (wallet.balance > 0) {
    return console.error("Wallet has funds and cannot be deleted");
  }
  currentUser.wallets = currentUser.wallets.filter((w) => w.id !== walletId);
  console.log(
    `${currentUser.username} ${wallet.currency} walletID ${walletId} has been deleted`
  );
  return "Wallet deleted successfully";
}

function transferFunds({
  toUser,
  fromWalletId,
  toWalletId,
  amount,
}: TransferFunds) {
  if (!currentUser) return console.error("User not logged in");
  const fromWallet = findWallet({ user: currentUser, walletId: fromWalletId });
  const toWallet = findWallet({ user: toUser, walletId: toWalletId });

  if (!fromWallet || !toWallet) {
    return console.error("Wallet not found");
  }

  const conversionRate =
    fromWallet.currency === "NGN" && toWallet.currency === "USD"
      ? CONVERSION_RATE_NGN_TO_USD
      : fromWallet.currency === toWallet.currency
      ? 1
      : CONVERSION_RATE_USD_TO_NGN;

  if (fromWallet.balance < amount) {
    return console.error("Insufficient funds");
  }

  console.log(
    `Transferring ${amount} from ${currentUser.username} ${fromWallet.currency} to ${toUser.username} ${toWallet.currency}`
  );
  fromWallet.balance -= amount;
  toWallet.balance += amount * conversionRate;

  transactions.push({
    fromWalletId,
    toWalletId,
    amount,
    conversionRate,
  });

  return "Transfer successful";
}

// TESTS
signUp({ username: "george", password: "123456789" });
signUp({ username: "toyan", password: "secret" });
signUp({ username: "george", password: "123455" });

login({ username: "george", password: "123456789" });

createWallet({ currency: "USD" });

const georgeNGNWallet = currentUser!.wallets[0];

const georgeUSDWallet = currentUser!.wallets[1];
depositToWallet({ walletId: georgeNGNWallet.id, amount: 1000000 });

depositToWallet({ walletId: georgeUSDWallet.id, amount: 10000 });

logout();
login({ username: "toyan", password: "secret" });
createWallet({ currency: "USD" });
const toyan = currentUser!;
const toyanNGNWallet = toyan.wallets[0];
const toyanUSDWallet = toyan.wallets[1];
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

const emptyWallet = currentUser!.wallets[currentUser!.wallets.length - 1];

deleteWallet({ walletId: emptyWallet.id });
deleteWallet({ walletId: georgeUSDWallet.id });

console.log("George's wallets:", currentUser!.wallets);

logout();
login({ username: "toyan", password: "secret" });
console.log("Toyan's wallets:", currentUser!.wallets);
console.log("Transactions:", transactions);

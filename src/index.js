const { ethers } = require("ethers");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

function hex2str(hex) {
  return ethers.toUtf8String(hex);
}

function str2hex(str) {
  return ethers.hexlify(ethers.toUtf8Bytes(str));
}

let totalChecks = 0;
let palindromeCount = 0;
let userSubmissions = {};

function isPalindrome(word) {
  const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanWord === cleanWord.split('').reverse().join('');
}

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));

  const metadata = data["metadata"];
  const sender = metadata["msg_sender"];
  const payload = data["payload"];

  let word = hex2str(payload);

  if (word.length === 0) {
    const report_req = await fetch(rollup_server + "/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: str2hex("Invalid input. Please submit a non-empty word or phrase.") }),
    });
    return "reject";
  }

  const isPalindromeResult = isPalindrome(word);
  totalChecks++;
  if (isPalindromeResult) palindromeCount++;

  if (!userSubmissions[sender]) {
    userSubmissions[sender] = { checks: 0, palindromes: 0 };
  }
  userSubmissions[sender].checks++;
  if (isPalindromeResult) userSubmissions[sender].palindromes++;

  const result = `"${word}" is ${isPalindromeResult ? '' : 'not '}a palindrome.`;
  
  const notice_req = await fetch(rollup_server + "/notice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: str2hex(result) }),
  });

  return "accept";
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));

  const payload = data["payload"];
  const route = hex2str(payload);

  let responseObject;
  if (route === "stats") {
    responseObject = JSON.stringify({
      totalChecks,
      palindromeCount,
      palindromePercentage: totalChecks > 0 ? (palindromeCount / totalChecks) * 100 : 0
    });
  } else if (route === "users") {
    responseObject = JSON.stringify(userSubmissions);
  } else {
    responseObject = "route not implemented";
  }

  const report_req = await fetch(rollup_server + "/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: str2hex(responseObject) }),
  });

  return "accept";
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();

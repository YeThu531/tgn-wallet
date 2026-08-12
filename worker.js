/*
=========================================================
 TGN WALLET - CLOUDFLARE WORKER
 Backend / TON Center Proxy
=========================================================

Routes:
  GET /
  GET /health
  GET /api/health
  GET /api/balance?address=...
  GET /getAddressBalance?address=...
  GET /getTransactions?address=...&limit=20

Secret:
  TONCENTER_API_KEY

IMPORTANT:
  TONCENTER_API_KEY ကို code ထဲ မထည့်ပါနဲ့။
  Cloudflare Worker Environment Variable / Secret ထဲထည့်ပါ။
=========================================================
*/

const TONCENTER_API = "https://toncenter.com/api/v2";

// -------------------------------------------------------
// CORS
// -------------------------------------------------------

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json; charset=UTF-8"
  };
}


// -------------------------------------------------------
// JSON RESPONSE
// -------------------------------------------------------

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: corsHeaders()
    }
  );
}


// -------------------------------------------------------
// OPTIONS
// -------------------------------------------------------

function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}


// -------------------------------------------------------
// TON CENTER REQUEST
// -------------------------------------------------------

async function tonCenterRequest(path, env) {

  if (!env.TONCENTER_API_KEY) {
    throw new Error(
      "TONCENTER_API_KEY is not configured"
    );
  }

  const response = await fetch(
    TONCENTER_API + path,
    {
      method: "GET",
      headers: {
        "X-API-Key": env.TONCENTER_API_KEY,
        "Accept": "application/json"
      }
    }
  );

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      ok: false,
      error: "Invalid TON Center response"
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: data
    };
  }

  return data;
}


// -------------------------------------------------------
// GET BALANCE
// -------------------------------------------------------

async function getAddressBalance(address, env) {

  if (!address) {
    return json(
      {
        ok: false,
        error: "Wallet address is required"
      },
      400
    );
  }

  try {

    const result =
      await tonCenterRequest(
        "/getAddressBalance?address=" +
        encodeURIComponent(address),
        env
      );

    if (!result.ok) {
      return json(
        {
          ok: false,
          error: "TON Center balance request failed",
          details: result
        },
        502
      );
    }

    /*
      TON Center returns:

      {
        "ok": true,
        "result": "123456789"
      }

      result is nanoTON.
    */

    const nanoTON =
      Number(result.result);

    if (!Number.isFinite(nanoTON)) {
      return json(
        {
          ok: false,
          error: "Invalid balance returned by TON Center"
        },
        502
      );
    }

    const balance =
      nanoTON / 1000000000;

    return json({
      ok: true,
      address,
      balance,
      nanoTON
    });

  } catch (error) {

    return json(
      {
        ok: false,
        error: "Balance request failed",
        message: error?.message || "Unknown error"
      },
      500
    );
  }
}


// -------------------------------------------------------
// GET TRANSACTIONS
// -------------------------------------------------------

async function getTransactions(
  address,
  limit,
  env
) {

  if (!address) {
    return json(
      {
        ok: false,
        error: "Wallet address is required"
      },
      400
    );
  }

  let txLimit =
    Number.parseInt(limit || "20", 10);

  if (!Number.isFinite(txLimit)) {
    txLimit = 20;
  }

  txLimit =
    Math.max(
      1,
      Math.min(
        txLimit,
        100
      )
    );

  try {

    const result =
      await tonCenterRequest(
        "/getTransactions" +
        "?address=" +
        encodeURIComponent(address) +
        "&limit=" +
        txLimit,
        env
      );

    if (!result.ok) {
      return json(
        {
          ok: false,
          error: "TON Center transaction request failed",
          details: result
        },
        502
      );
    }

    return json({
      ok: true,
      address,
      transactions:
        Array.isArray(result.result)
          ? result.result
          : []
    });

  } catch (error) {

    return json(
      {
        ok: false,
        error: "Transaction request failed",
        message:
          error?.message ||
          "Unknown error"
      },
      500
    );
  }
}


// -------------------------------------------------------
// MAIN WORKER
// -------------------------------------------------------

export default {

  async fetch(request, env, ctx) {

    // -----------------------------------------------
    // OPTIONS / CORS
    // -----------------------------------------------

    if (request.method === "OPTIONS") {
      return handleOptions();
    }


    // -----------------------------------------------
    // GET ONLY
    // -----------------------------------------------

    if (request.method !== "GET") {

      return json(
        {
          ok: false,
          error: "Method not allowed"
        },
        405
      );

    }


    const url =
      new URL(request.url);

    const path =
      url.pathname;


    // -----------------------------------------------
    // HOME
    // -----------------------------------------------

    if (path === "/") {

      return json({
        ok: true,
        service: "TGN Wallet API",
        status: "online"
      });

    }


    // -----------------------------------------------
    // HEALTH
    // -----------------------------------------------

    if (
      path === "/health" ||
      path === "/api/health"
    ) {

      return json({
        ok: true,
        status: "online",
        service: "TGN Wallet Worker",
        timestamp:
          new Date().toISOString()
      });

    }


    // -----------------------------------------------
    // BALANCE
    //
    // New frontend route:
    // /api/balance?address=...
    //
    // Old route also supported:
    // /getAddressBalance?address=...
    // -----------------------------------------------

    if (
      path === "/api/balance" ||
      path === "/getAddressBalance"
    ) {

      const address =
        url.searchParams.get(
          "address"
        );

      return await getAddressBalance(
        address,
        env
      );

    }


    // -----------------------------------------------
    // TRANSACTIONS
    // -----------------------------------------------

    if (
      path === "/api/transactions" ||
      path === "/getTransactions"
    ) {

      const address =
        url.searchParams.get(
          "address"
        );

      const limit =
        url.searchParams.get(
          "limit"
        ) || "20";

      return await getTransactions(
        address,
        limit,
        env
      );

    }


    // -----------------------------------------------
    // 404
    // -----------------------------------------------

    return json(
      {
        ok: false,
        error: "Route not found",
        path
      },
      404
    );

  }

};

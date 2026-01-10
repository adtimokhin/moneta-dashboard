type Id = string | number;

////////////////////////////////////////////////////////////////////////////////
//                                CONSTANTS
////////////////////////////////////////////////////////////////////////////////
const V1_PREFIX = "v1";
const V1_ENTITY_USER = "user";
const V1_ENTITY_COMPANY = "company";
const V1_ENTITY_COMPANY_ADDRESS = "company-address";
const V1_ENTITY_INSTRUMENT = "instrument";
const V1_ENTITY_LISTING = "listing";
const V1_ENTITY_BID = "bid";
const V1_ENTITY_ASK = "ask";
const V1_ACTION_WORD_SEARCH = "search";
const V1_ACTION_WORD_DELETE = "delete";
const V1_ACTION_WORD_TRANSITION = "transition";

/**
 * An object that contains the most current list of all supported endpoints from
 * the backend of Moneta Financial.
 *
 * It is organized into the type of the endpoints selected (like v1, v2, etc).
 *
 * Naming convention:
 * - Function names should start with an entity they relate to (except for when there is no entity involved)
 * - Entity name is in singular
 * - Use CamelCase
 * - Use a single verb to describe the action of the endpoint
 * - List any important path variables in the name
 *
 * You can also use the constants defined above in this file to define the
 * actual paths. Use them so that you do not make a typos.
 */
export const EP = {
  v1: {
    // auth
    login: () => v1Path("auth", "login"),
    logout: () => v1Path("auth", "logout"),

    // users
    userGetAll: () => v1Path(V1_ENTITY_USER),
    userCreate: () => v1Path(V1_ENTITY_USER),
    userGetById: (id: Id) => v1Path(V1_ENTITY_USER, id),
    userSearch: () => v1Path(V1_ENTITY_USER, V1_ACTION_WORD_SEARCH),
    userDeleteById: (id: Id) => v1Path(V1_ENTITY_USER, id),
    userPatchById: (id: Id) => v1Path(V1_ENTITY_USER, id),
    me: () => v1Path("me"),

    // companies
    companyGetAll: () => v1Path(V1_ENTITY_COMPANY),
    companyCreate: () => v1Path(V1_ENTITY_COMPANY),
    companyGetById: (id: Id) => v1Path(V1_ENTITY_COMPANY, id),
    companySearch: () => v1Path(V1_ENTITY_COMPANY, V1_ACTION_WORD_SEARCH),

    // company addresses
    companyAddressGetAll: () => v1Path(V1_ENTITY_COMPANY_ADDRESS),
    companyAddressCreate: () => v1Path(V1_ENTITY_COMPANY_ADDRESS),

    // instruments
    instrumentCreate: () => v1Path(V1_ENTITY_INSTRUMENT),
    instrumentUpdateDraftById: (id: Id) => v1Path(V1_ENTITY_INSTRUMENT, id),
    instrumentGetById: (id: Id) => v1Path(V1_ENTITY_INSTRUMENT, id),
    instrumentSearch: () => v1Path(V1_ENTITY_INSTRUMENT, V1_ACTION_WORD_SEARCH),
    instrumentTransition: (id: Id) =>
      v1Path(V1_ENTITY_INSTRUMENT, id, V1_ACTION_WORD_TRANSITION),

    // listings
    listingSearch: () => v1Path(V1_ENTITY_LISTING, V1_ACTION_WORD_SEARCH),
    listingGetById: (id: Id) => v1Path(V1_ENTITY_LISTING, id),

    // bids
    bidSearch: () => v1Path(V1_ENTITY_BID, V1_ACTION_WORD_SEARCH),
    bidGetById: (id: Id) => v1Path(V1_ENTITY_BID, id),

    // asks
    askSearch: () => v1Path(V1_ENTITY_ASK, V1_ACTION_WORD_SEARCH),
    askGetById: (id: Id) => v1Path(V1_ENTITY_ASK, id),
  },
};

// Small helper to build v1 paths without repeating `/v1` everywhere
const v1Path = (...segments: (string | number)[]) =>
  `/${[V1_PREFIX, ...segments].join("/")}`;

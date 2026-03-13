const TABLES = {
  USERS: 'Users Table',
  LISTINGS: 'Listings Table',
  INVESTMENTS: 'Investments Table',
  LISTING_MEDIA: 'Listing Media Table',
};

const RELATIONS = {
  USERS: `"${TABLES.USERS}"`,
  LISTINGS: `"${TABLES.LISTINGS}"`,
  INVESTMENTS: `"${TABLES.INVESTMENTS}"`,
  LISTING_MEDIA: `"${TABLES.LISTING_MEDIA}"`,
};

module.exports = {
  TABLES,
  RELATIONS,
};

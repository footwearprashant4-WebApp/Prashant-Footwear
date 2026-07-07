# Prashant Footwear Security Specification

This document defines the security architecture and invariants for the Prashant Footwear backend (Firestore), followed by twelve test scenarios (the "Dirty Dozen") and their corresponding security validations.

## 1. Data Invariants

1. **Product Integrity**: Products can only be created, updated, or deleted by verified administrative accounts listed in `/admins/{uid}` or authenticated as admins. Sizes and prices must be positive numbers.
2. **Profile Isolation**: Users can only read and write their own profile document `/users/{userId}`. Non-owners cannot read, write, or list other user profiles (PII isolation).
3. **Admin Exclusivity**: Admin status is derived solely by the presence of a document in the `/admins/{userId}` collection. Users are strictly forbidden from modifying this collection, setting their own role to 'admin', or adding themselves to the `/admins/` list.
4. **Order Integrity**: Orders must be linked to a valid client mobile. Only the ordering user (or an Admin) can retrieve their specific order records.
5. **Timestamp Temporal Integrity**: All `createdAt` fields must be immutable and match `request.time` exactly. `updatedAt` must be set to `request.time` on updates.

---

## 2. The "Dirty Dozen" Payloads (Attacks & Vulnerabilities)

The following payloads represent malicious attempts to bypass system constraints:

### Payload 1: Anonymous Product Creation
*   **Target**: `/products/new-boot`
*   **Attack**: Unauthenticated client attempts to create a high-priced product.
*   **Expected Result**: `PERMISSION_DENIED`

### Payload 2: Customer Privilege Escalation to Admin
*   **Target**: `/users/customer_123`
*   **Attack**: Regular customer tries to modify their profile and set their own `role` to `'admin'`.
*   **Expected Result**: `PERMISSION_DENIED`

### Payload 3: Direct Admin Collection Poisoning
*   **Target**: `/admins/hacker_uid`
*   **Attack**: Regular user attempts to insert themselves into the `/admins` collection to elevate their role.
*   **Expected Result**: `PERMISSION_DENIED`

### Payload 4: Overwriting Product CreatedAt (Immutability Bypass)
*   **Target**: `/products/sneaker_123`
*   **Attack**: Authenticated admin updates an existing product, changing its original `createdAt` timestamp.
*   **Expected Result**: `PERMISSION_DENIED`

### Payload 5: Denying Wallet (Resource Exhaustion String Injection)
*   **Target**: `/products/bad_prod_id`
*   **Attack**: Client tries to create a product with a 1MB string in the `name` field.
*   **Expected Result**: `PERMISSION_DENIED` (Strict size check on `name` <= 150 characters)

### Payload 6: Invalid Document ID Poisoning
*   **Target**: `/products/invalid_id!@#%^&*()`
*   **Attack**: Client attempts to create a product with a special character/extremely long ID to poison the database router.
*   **Expected Result**: `PERMISSION_DENIED` (ID must conform to `isValidId` regex `^[a-zA-Z0-9_\-]+$`)

### Payload 7: Client-Side Read Scraping (Blanket User Reads)
*   **Target**: `/users` (Collection Query)
*   **Attack**: Regular user requests list of all user profiles to harvest phone numbers (PII Leak).
*   **Expected Result**: `PERMISSION_DENIED` (Blanket listing or non-owner access forbidden)

### Payload 8: Unauthorized Product Deletion
*   **Target**: `/products/luxury_heels`
*   **Attack**: Non-admin client tries to delete a footwear catalog item.
*   **Expected Result**: `PERMISSION_DENIED`

### Payload 9: Malicious Sizing Range
*   **Target**: `/products/boots_101`
*   **Attack**: Admin attempts to set an invalid product size format or missing fields.
*   **Expected Result**: `PERMISSION_DENIED`

### Payload 10: Snooping Other Orders (Order Data Leak)
*   **Target**: `/orders/order_of_user_abc`
*   **Attack**: Customer `user_xyz` attempts to fetch the order invoice of `user_abc`.
*   **Expected Result**: `PERMISSION_DENIED`

### Payload 11: Tampering Sibling Order State (Shortcut States)
*   **Target**: `/orders/order_123`
*   **Attack**: Customer attempts to directly transition order status to `'completed'` or delete historic sales logs without being an admin.
*   **Expected Result**: `PERMISSION_DENIED`

### Payload 12: Invalid Timestamp Modification
*   **Target**: `/products/shoe_999`
*   **Attack**: Admin updates a product but tries to set the `updatedAt` to a historical or future date instead of `request.time`.
*   **Expected Result**: `PERMISSION_DENIED`

---

## 3. Test Runner Blueprint

We have set up these validation targets inside the `firestore.rules`.
The `DRAFT_firestore.rules` and final `firestore.rules` will be deployed using `deploy_firebase`.

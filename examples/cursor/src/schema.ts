import { Schema } from "effect"

// ── Branded primitives ──────────────────────────────────────

export const SchemaName = Schema.String.pipe(
  Schema.minLength(1),
  Schema.brand("SchemaName")
)
export type SchemaName = typeof SchemaName.Type

export const JsonInput = Schema.String.pipe(
  Schema.minLength(1),
  Schema.brand("JsonInput")
)
export type JsonInput = typeof JsonInput.Type

// ── Built-in schema registry keys ──────────────────────────

export const BuiltinSchemaKey = Schema.Literal("user", "product", "address")
export type BuiltinSchemaKey = typeof BuiltinSchemaKey.Type

// ── User schema ─────────────────────────────────────────────

export const Email = Schema.String.pipe(
  Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/),
  Schema.brand("Email")
)
export type Email = typeof Email.Type

export const Age = Schema.Number.pipe(
  Schema.int(),
  Schema.greaterThanOrEqualTo(0),
  Schema.lessThanOrEqualTo(150),
  Schema.brand("Age")
)
export type Age = typeof Age.Type

export class User extends Schema.Class<User>("User")({
  name: Schema.String.pipe(Schema.minLength(1)),
  email: Email,
  age: Age,
}) {}

// ── Product schema ──────────────────────────────────────────

export const Price = Schema.Number.pipe(
  Schema.positive(),
  Schema.brand("Price")
)
export type Price = typeof Price.Type

export const Sku = Schema.String.pipe(
  Schema.pattern(/^[A-Z]{2,4}-\d{3,6}$/),
  Schema.brand("Sku")
)
export type Sku = typeof Sku.Type

export class Product extends Schema.Class<Product>("Product")({
  sku: Sku,
  title: Schema.String.pipe(Schema.minLength(1)),
  price: Price,
  inStock: Schema.Boolean,
}) {}

// ── Address schema ──────────────────────────────────────────

export const ZipCode = Schema.String.pipe(
  Schema.pattern(/^\d{5}(-\d{4})?$/),
  Schema.brand("ZipCode")
)
export type ZipCode = typeof ZipCode.Type

export class Address extends Schema.Class<Address>("Address")({
  street: Schema.String.pipe(Schema.minLength(1)),
  city: Schema.String.pipe(Schema.minLength(1)),
  state: Schema.String.pipe(Schema.length(2)),
  zip: ZipCode,
}) {}

// ── Validation result ───────────────────────────────────────

export class ValidationResult extends Schema.Class<ValidationResult>("ValidationResult")({
  valid: Schema.Boolean,
  schemaName: SchemaName,
  input: Schema.String,
  errors: Schema.Array(Schema.String),
}) {}

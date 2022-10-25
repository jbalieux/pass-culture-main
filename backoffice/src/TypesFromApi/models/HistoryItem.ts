/* tslint:disable */
/* eslint-disable */
/**
 * pass Culture backoffice API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime'
import {
  ActionType,
  ActionTypeFromJSON,
  ActionTypeFromJSONTyped,
  ActionTypeToJSON,
} from './'

/**
 *
 * @export
 * @interface HistoryItem
 */
export interface HistoryItem {
  /**
   *
   * @type {number}
   * @memberof HistoryItem
   */
  accountId?: number | null
  /**
   *
   * @type {string}
   * @memberof HistoryItem
   */
  accountName?: string | null
  /**
   *
   * @type {number}
   * @memberof HistoryItem
   */
  authorId?: number | null
  /**
   *
   * @type {string}
   * @memberof HistoryItem
   */
  authorName?: string | null
  /**
   *
   * @type {string}
   * @memberof HistoryItem
   */
  comment?: string | null
  /**
   *
   * @type {Date}
   * @memberof HistoryItem
   */
  date: Date
  /**
   *
   * @type {ActionType}
   * @memberof HistoryItem
   */
  type: ActionType
}

export function HistoryItemFromJSON(json: any): HistoryItem {
  return HistoryItemFromJSONTyped(json, false)
}

export function HistoryItemFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): HistoryItem {
  if (json === undefined || json === null) {
    return json
  }
  return {
    accountId: !exists(json, 'accountId') ? undefined : json['accountId'],
    accountName: !exists(json, 'accountName') ? undefined : json['accountName'],
    authorId: !exists(json, 'authorId') ? undefined : json['authorId'],
    authorName: !exists(json, 'authorName') ? undefined : json['authorName'],
    comment: !exists(json, 'comment') ? undefined : json['comment'],
    date: new Date(json['date']),
    type: ActionTypeFromJSON(json['type']),
  }
}

export function HistoryItemToJSON(value?: HistoryItem | null): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    accountId: value.accountId,
    accountName: value.accountName,
    authorId: value.authorId,
    authorName: value.authorName,
    comment: value.comment,
    date: value.date.toISOString(),
    type: ActionTypeToJSON(value.type),
  }
}

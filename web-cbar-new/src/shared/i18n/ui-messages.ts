/**
 * Kit-in öz mətnləri (spec 002 FR-024, research R6).
 *
 * `@cbar/lib-react-ui-kit` səhifələmə, çekmecə, dialoq və s. üçün 31 daxili
 * etiket daşıyır; `UIMessagesProvider` onları bir dəfə, `AppProviders`-də dəyişir.
 * Bu fayl `react-i18next`-dən asılı deyil — kataloq statikdir və hər iki dildə
 * eyni açar dəstinə malikdir (test bunu kilidləyir).
 */
import type { UIMessages } from '@cbar/lib-react-ui-kit/i18n'

import type { Locale } from './index'

const az: Required<UIMessages> = {
  'dialog.close': 'Bağla',
  'sheet.close': 'Bağla',
  'pagination.label': 'Səhifələmə',
  'pagination.previous': 'Əvvəlki səhifəyə keç',
  'pagination.next': 'Növbəti səhifəyə keç',
  'pagination.morePages': 'Daha çox səhifə',
  'breadcrumb.label': 'Naviqasiya zənciri',
  'breadcrumb.more': 'Daha çox',
  'datePicker.clear': 'Tarixi təmizlə',
  'treeSelect.searchPlaceholder': 'Axtarış…',
  'treeSelect.placeholder': 'Seçin…',
  'treeSelect.empty': 'Nəticə tapılmadı.',
  'treeSelect.clear': 'Seçimi təmizlə',
  'toast.label': 'Bildirişlər',
  'toast.dismiss': 'Bildirişi bağla',
  'dataTable.empty': 'Nəticə yoxdur.',
  'dataTable.selectAllRows': 'Bütün sətirləri seç',
  'dataTable.selectRow': 'Sətri seç',
  'dataTable.expandRow': 'Sətri aç',
  'dataTable.collapseRow': 'Sətri bağla',
  'combobox.placeholder': 'Seçim edin…',
  'combobox.searchPlaceholder': 'Axtarış…',
  'combobox.empty': 'Nəticə tapılmadı.',
  'tree.empty': 'Məlumat yoxdur.',
  'upload.title': 'Faylları bura atın və ya seçin',
  'upload.hint': 'Hər biri 10 MB-a qədər',
  'select.clear': 'Seçimi təmizlə',
  'spinner.label': 'Yüklənir',
  'command.label': 'Təkliflər',
  'command.dialogTitle': 'Əmr paneli',
  'command.dialogDescription': 'İcra etmək üçün əmr axtarın…',
}

const en: Required<UIMessages> = {
  'dialog.close': 'Close',
  'sheet.close': 'Close',
  'pagination.label': 'Pagination',
  'pagination.previous': 'Go to previous page',
  'pagination.next': 'Go to next page',
  'pagination.morePages': 'More pages',
  'breadcrumb.label': 'Breadcrumb',
  'breadcrumb.more': 'More',
  'datePicker.clear': 'Clear date',
  'treeSelect.searchPlaceholder': 'Search…',
  'treeSelect.placeholder': 'Select…',
  'treeSelect.empty': 'No results found.',
  'treeSelect.clear': 'Clear selection',
  'toast.label': 'Notifications',
  'toast.dismiss': 'Dismiss notification',
  'dataTable.empty': 'No results.',
  'dataTable.selectAllRows': 'Select all rows',
  'dataTable.selectRow': 'Select row',
  'dataTable.expandRow': 'Expand row',
  'dataTable.collapseRow': 'Collapse row',
  'combobox.placeholder': 'Select an option…',
  'combobox.searchPlaceholder': 'Search…',
  'combobox.empty': 'No results found.',
  'tree.empty': 'No data.',
  'upload.title': 'Drop files here, or click to browse',
  'upload.hint': 'Up to 10 MB each',
  'select.clear': 'Clear selection',
  'spinner.label': 'Loading',
  'command.label': 'Suggestions',
  'command.dialogTitle': 'Command palette',
  'command.dialogDescription': 'Search for a command to run…',
}

export const uiMessages: Record<Locale, Required<UIMessages>> = { az, en }

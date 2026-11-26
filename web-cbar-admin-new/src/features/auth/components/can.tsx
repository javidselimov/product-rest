/**
 * Permission-əsaslı rendering (guideline §5.8). Bu UI gate-dir — təhlükəsizlik
 * yoxlaması deyil; real yetki yoxlaması backend-də aparılır.
 */

import type { ReactNode } from 'react'

import { hasPermission, type Permission } from '@/entities/user/model/types'
import { useAuthStore } from '../model/auth-store'

interface CanProps {
  permission: Permission
  children: ReactNode
  /** İcazə olmayanda nə göstərilsin (default: heç nə). */
  fallback?: ReactNode
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const user = useAuthStore((state) => state.user)
  return hasPermission(user, permission) ? children : fallback
}

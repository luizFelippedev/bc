// src/utils/SecurityUtils.ts
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

export class SecurityUtils {
  /**
   * Gera uma senha aleatória segura
   * @param length Comprimento da senha (padrão: 12)
   * @param includeSymbols Incluir símbolos na senha (padrão: true)
   */
  public static generateSecurePassword(length: number = 12, includeSymbols: boolean = true): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+{}:"<>?|[];\',./`~';
    
    let chars = lowercase + uppercase + numbers;
    if (includeSymbols) {
      chars += symbols;
    }
    
    // Garantir requisitos mínimos de complexidade
    let password = '';
    password += lowercase[this.getRandomInt(0, lowercase.length - 1)];
    password += uppercase[this.getRandomInt(0, uppercase.length - 1)];
    password += numbers[this.getRandomInt(0, numbers.length - 1)];
    
    if (includeSymbols) {
      password += symbols[this.getRandomInt(0, symbols.length - 1)];
    }
    
    // Completar com caracteres aleatórios
    const remainingLength = length - password.length;
    for (let i = 0; i < remainingLength; i++) {
      password += chars[this.getRandomInt(0, chars.length - 1)];
    }
    
    // Embaralhar a senha
    return this.shuffleString(password);
  }

  /**
   * Gera um token aleatório
   * @param length Comprimento do token em bytes (padrão: 32)
   */
  public static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Gera um hash seguro de uma senha
   * @param password Senha a ser hasheada
   * @param saltRounds Número de rounds para o salt (padrão: 10)
   */
  public static async hashPassword(password: string, saltRounds: number = 10): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica se uma senha corresponde a um hash
   * @param password Senha a ser verificada
   * @param hash Hash para comparação
   */
  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Gera um número aleatório entre min e max (inclusive)
   */
  private static getRandomInt(min: number, max: number): number {
    return Math.floor(crypto.randomInt(min, max + 1));
  }

  /**
   * Embaralha uma string
   */
  private static shuffleString(str: string): string {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.getRandomInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  }
}
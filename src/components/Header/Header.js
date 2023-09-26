import React from 'react';
import { GitHub } from 'react-feather';
import styles from './Header.module.css';

export default function Header() {
  return (
    <div className={styles.HeaderWrapper}>
      <div className={styles.Logo}>Anti Social Recovery (A.S.R.)</div>
      <div className={styles.Github}>
        <p>Check out our repo here</p>
        <a
          href='https://github.com/crystaltai/anti-social-recovery-club-2'
          target='_blank'
        >
          <GitHub size={35} stroke='white' className={styles.GithubIcon} />
        </a>
      </div>
    </div>
  );
}

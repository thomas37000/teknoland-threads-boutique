 # Project architecture

- Blog pages share `PostEditor` for admin and on-page editing; authorization is enforced by database policies so both entry points have identical permissions.
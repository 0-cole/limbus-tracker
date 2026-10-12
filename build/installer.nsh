!macro customUnInstall
  ${if} ${isUpdated}
    # During an in-place update, skip deleting shortcuts so Windows Explorer does NOT unpin Limbus Tracker from the Taskbar
    Return
  ${endIf}
!macroend

!macro customInstall
  # Ensure Application User Model ID is stamped so Windows Taskbar pins remain attached across version updates
!macroend

# React Rating

## React setup

Import Rating from `@vyrnforge/react/rating`. CSS-aware browser bundlers load the canonical component styles.

## Basic usage

Pass defaultValue for uncontrolled usage or value and onValueChange for controlled usage. Supply aria-label or aria-labelledby.

## Sizes and precision

Use size="sm", "md" or "lg", max and precision={0.5} for half stars. Read-only values are not rounded to the interactive precision.

## State and forms

Supply name for form submission, required and aria-invalid/aria-describedby as needed. Pass clearable to clear when the committed choice is activated again (including Space). There is no separate button or clearLabel. Required, disabled and read-only ratings cannot clear. In controlled usage, onValueChange receives zero; the owner must commit it. An application-authored aria-describedby hint can explain the optional behavior. Programmatic updates and resets do not emit selection intent.

## Custom artwork and themes

Pass icon={heartIcon} using a granular catalog import, or author custom artwork with defineIcon. The typed rating token group supports filledColor, emptyColor, hoverColor and gap.

## Read-only scores

Pass readOnly and a complete accessible score label, with value representing the existing score. Compose Text for a visible average and review count.

## Migration

RatingRoot and RatingItem retain their existing whole-value native composition behavior. Prefer Rating for new usage. Existing authored Native Web and Elements composition remains available. Vue and Angular expose idiomatic generated Rating counterparts.

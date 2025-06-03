SELECT
  `l`.`live_session_id` AS `live_session_id`,
  `l`.`title` AS `title`,
  `l`.`platform` AS `platform`,
  `l`.`channel_id` AS `channel_id`,
  `l`.`channel_name` AS `channel_name`,
  `r`.`recording_id` AS `recording_id`,
  `r`.`video_url` AS `video_url`,
  `r`.`started_at` AS `started_at`,
  `r`.`completed_at` AS `completed_at`,
  `r`.`status` AS `status`,
  `s`.`user_id` AS `user_id`
FROM
  (
    (
      `mydb`.`LiveSession` `l`
      JOIN `mydb`.`Subscription` `s` ON(
        (
          (`l`.`streamer_id` = `s`.`streamer_id`)
          AND (`s`.`is_connected` = TRUE)
        )
      )
    )
    LEFT JOIN `mydb`.`Recording` `r` ON((`l`.`live_session_id` = `r`.`live_session_id`))
  )
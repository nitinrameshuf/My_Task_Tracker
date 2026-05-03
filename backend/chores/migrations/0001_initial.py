from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='FamilyMember',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('color', models.CharField(default='#6366f1', max_length=7)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ['name']},
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('color', models.CharField(default='#64748b', max_length=7)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ['name'], 'verbose_name_plural': 'categories'},
        ),
        migrations.CreateModel(
            name='Chore',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True, default='')),
                ('priority', models.CharField(
                    choices=[('high', 'High'), ('medium', 'Medium'), ('low', 'Low')],
                    default='medium', max_length=10,
                )),
                ('recurrence_type', models.CharField(
                    choices=[('none', 'None'), ('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly')],
                    default='none', max_length=10,
                )),
                ('recurrence_days', models.JSONField(blank=True, default=list)),
                ('recurrence_day_of_month', models.IntegerField(blank=True, null=True)),
                ('start_date', models.DateField()),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('category', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='chores', to='chores.category',
                )),
                ('assignee', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='chores', to='chores.familymember',
                )),
            ],
            options={'ordering': ['name']},
        ),
        migrations.CreateModel(
            name='ChoreCompletion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('completed_at', models.DateTimeField(auto_now_add=True)),
                ('chore', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='completions', to='chores.chore',
                )),
            ],
            options={'ordering': ['-date']},
        ),
        migrations.AlterUniqueTogether(
            name='chorecompletion',
            unique_together={('chore', 'date')},
        ),
    ]
